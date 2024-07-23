import { GenericData } from '@/app/(logic)/types';
import { IndicatorStreamMetadata, prependSpreadFunctions } from '@/logic/get-consolidated-series-new';
import { Trigger, TriggerId } from '@/components/triggers/edit-trigger';
import { UTCTimestamp } from 'lightweight-charts';
import { buildTriggerFunc } from '@/logic/triggers/build-trigger-functions';
import { prefixBuiltInFunctions } from '@/logic/built-in-functions/aggregations/prefix-built-in-functions';
import { getDependentIndicators } from '@/logic/indicators/get-dependent-indicators';
import { DefaultOperatorType, Indicator } from '@/logic/indicators/types';

export const OPERATOR_LOOKBACK_MAP: Record<DefaultOperatorType, number> = {
  crossover: 3, // Faciltates the equal in the middle case - should 2...?
  crossunder: 3, // Faciltates the equal in the middle case
  '>': 0,
  '<': 0,
  '>=': 0,
  '<=': 0,
  '==': 0,
};

export function calculateTriggerEvents({
  data,
  streams,
  delayMap,
  triggers,
  streamTagIndicatorMap,
}: {
  data: GenericData[];
  streams: IndicatorStreamMetadata[];
  delayMap: Record<string, number>;
  triggers: Trigger[];
  streamTagIndicatorMap: Record<string, Indicator>;
}): Record<TriggerId, { time: UTCTimestamp; occurrence: number }[]> {
  const result: Record<TriggerId, { time: UTCTimestamp; occurrence: number }[]> = {};

  const triggerFunctionMap: Record<
    TriggerId,
    {
      lookback: number;
      delay: number;
      func: Function; // (data: GenericData[]) => boolean;
    }
  > = {};

  const enabledTriggers = triggers.filter(trigger => trigger.enabled);

  // 1. Build trigger function map with required lookback
  for (const trigger of enabledTriggers) {
    const operatorLookbacks = trigger.conditions
      .map(condition => OPERATOR_LOOKBACK_MAP[condition.operator.type])
      .filter(l => l != null);

    const lookback = trigger.conditions.reduce((acc, condition) => {
      return Math.max(acc, condition.fieldA.offset, condition.fieldB.offset, ...operatorLookbacks);
    }, 0);

    const triggerFuncStr = buildTriggerFunc({ trigger });
    const funcStr = prependSpreadFunctions({
      funcString: `${prefixBuiltInFunctions(triggerFuncStr)}

// Call the user provided function
return trigger();`,
      existingIndicatorMetadata: streams,
    });
    const func = new Function('data', funcStr);

    // Get the longest indicator lookback (for any indicators used in the trigger)
    const indicatorDependencies = getDependentIndicators({
      funcStr: triggerFuncStr,
      streamTagIndicatorMap,
    });

    // const indicatorTags = new Set(streams.map(stream => stream.indicatorTag));
    const delays = indicatorDependencies.map(tag => delayMap[tag]);
    const delay = Math.max(...delays, 0);

    triggerFunctionMap[trigger.id] = {
      lookback,
      func,
      delay,
    };
  }

  const triggerCountMap: Record<TriggerId, number> = {};

  // 2. Iterate over the data and apply each trigger function
  for (let i = 0; i < data.length; i++) {
    for (const trigger of enabledTriggers) {
      const triggerFunc = triggerFunctionMap[trigger.id];
      if (i < triggerFunc.delay + triggerFunc.lookback) {
        continue;
      }

      const lookbackData = data.slice(i - triggerFunc.lookback, i);

      // We reverse it to mirror trading view data[0] = now, data[1] = 1 candle ago
      const reversedLookbackSeries = lookbackData.reverse();
      if (triggerFunc.func(reversedLookbackSeries)) {
        // Update the trigger count
        triggerCountMap[trigger.id] = triggerCountMap[trigger.id] ?? 0;
        triggerCountMap[trigger.id]++;

        result[trigger.id] = result[trigger.id] ?? [];
        result[trigger.id].push({
          time: reversedLookbackSeries[0].time,
          occurrence: triggerCountMap[trigger.id],
        }); // The previous candle to signfiy the trigger
      }
    }
  }

  return result;
}
