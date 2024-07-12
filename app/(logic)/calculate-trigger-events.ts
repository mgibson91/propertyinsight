import { GenericData } from '@/app/(logic)/types';
import { IndicatorStreamMetadata, prependSpreadFunctions } from '@/app/(logic)/get-consolidated-series-new';
import { Trigger, TriggerId } from '@/components/triggers/edit-trigger';
import { UTCTimestamp } from 'lightweight-charts';
import { buildTriggerFunc } from '@/app/(logic)/build-trigger-functions';
import { prefixBuiltInFunctions } from '@/logic/built-in-functions/aggregations/prefix-built-in-functions';

const OPERATOR_LOOKBACK_MAP: Record<string, number> = {
  crossover: 3, // Faciltates the equal in the middle case - should 2...?
  crossunder: 3, // Faciltates the equal in the middle case
  equal: 0,
  greater: 0,
  greaterOrEqual: 0,
  less: 0,
  lessOrEqual: 0,
};

export function calculateTriggerEvents({
  data,
  streams,
  delayMap,
  triggers,
}: {
  data: GenericData[];
  streams: IndicatorStreamMetadata[];
  delayMap: Record<string, number>;
  triggers: Trigger[];
}): Record<TriggerId, UTCTimestamp[]> {
  const result: Record<TriggerId, UTCTimestamp[]> = {};

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
      .map(condition => OPERATOR_LOOKBACK_MAP[condition.operator])
      .filter(l => l != null);

    const lookback = trigger.conditions.reduce((acc, condition) => {
      return Math.max(acc, condition.fieldA.offset, condition.fieldB.offset, ...operatorLookbacks);
    }, 0);

    // Get the longest indicator lookback
    const indicatorTags = new Set(streams.map(stream => stream.indicatorTag));
    const delays = Array.from(indicatorTags).map(tag => delayMap[tag]);
    const delay = Math.max(...delays);

    const triggerFuncStr = buildTriggerFunc({ trigger, delayMap });
    const funcStr = prependSpreadFunctions({
      funcString: `${prefixBuiltInFunctions(triggerFuncStr)}

// Call the user provided function
return trigger();`,
      existingIndicatorMetadata: streams,
    });
    const func = new Function('data', funcStr);

    triggerFunctionMap[trigger.id] = {
      lookback,
      func,
      delay,
    };
  }

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
      if (triggerFunc.func({ data: reversedLookbackSeries })) {
        result[trigger.id] = result[trigger.id] ?? [];
        result[trigger.id].push(data[i].time);
      }
    }
  }

  return result;
}
