import { GenericData } from '@/app/(logic)/types';
import { UTCTimestamp } from 'lightweight-charts';
import { OutcomeConfig, OutcomeId } from '@/logic/outcomes/types';
import { TriggerId } from '@/components/triggers/edit-trigger';
import { buildOutcomeFunc } from '@/logic/outcomes/build-outcome-functions';
import { OPERATOR_LOOKBACK_MAP } from '@/logic/triggers/calculate-trigger-events';
import { IndicatorStreamMetadata, prependSpreadFunctions } from '@/logic/get-consolidated-series-new';
import { prefixBuiltInFunctions } from '@/logic/built-in-functions/aggregations/prefix-built-in-functions';

export type OutcomeEvent = {
  trigger: { id: string; time: UTCTimestamp };
  outcome: {
    time: UTCTimestamp;
    wasSuccessful: boolean | null;
    offsetFromTrigger: number;
  };
};

/**
 * Pending triggers set
 *
 * - Set of triggers which haven’t been triggered
 * - OutcomeResult = { triggerId: OutcomeEvent }
 * - Overall Result - includes null
 *
 * Iterate over data, check the current data
 *
 * - current price (data)
 * - trigger specific data (trigger)
 * @param data
 * @param triggers
 */
export function calculateOutcomeEvents({
  data,
  streams,
  triggerEvents,
  outcomeConfigs,
}: {
  data: GenericData[];
  streams: IndicatorStreamMetadata[];
  triggerEvents: Record<TriggerId, UTCTimestamp[]>;
  outcomeConfigs: OutcomeConfig[];
}): OutcomeEvent[] {
  const outcomeFuncMap: Record<
    OutcomeId,
    {
      lookback: number;
      func: Function;
    }
  > = {};

  const enabledOutcomeConfigs = outcomeConfigs.filter(config => config.enabled);

  // Populate the outcome function map
  for (const outcome of enabledOutcomeConfigs) {
    const operatorLookbacks = [
      ...outcome.successConditions.map(condition => OPERATOR_LOOKBACK_MAP[condition.operator]),
      ...outcome.failureConditions.map(condition => OPERATOR_LOOKBACK_MAP[condition.operator]),
    ].filter(l => l != null);

    // TODO: This will be harder in code...... perhaps a manditory variable
    const lookback = Math.max(
      outcome.successConditions.reduce((acc, condition) => {
        return Math.max(acc, condition.fieldA.offset, condition.fieldB.offset, ...operatorLookbacks);
      }, 0),
      outcome.failureConditions.reduce((acc, condition) => {
        return Math.max(acc, condition.fieldA.offset, condition.fieldB.offset, ...operatorLookbacks);
      }, 0)
    );

    const outcomeFuncStr = buildOutcomeFunc({ outcome });
    const funcStr = prependSpreadFunctions({
      funcString: `${prefixBuiltInFunctions(outcomeFuncStr)}

// Call the user provided function
return outcome();`,
      existingIndicatorMetadata: streams,
    });
    const func = new Function('data', 'trigger', funcStr);

    outcomeFuncMap[outcome.id] = {
      func,
      lookback,
    };
  }

  const results: OutcomeEvent[] = [];

  enabledOutcomeConfigs.map(outcome => {
    const outcomeFunc = outcomeFuncMap[outcome.id];

    Object.entries(triggerEvents).map(([triggerId, triggerTimes]) => {
      triggerTimes.map(triggerTime => {
        const index = data.findIndex(({ time: dataTime }) => dataTime === triggerTime);
        if (index === -1) {
          return;
        }

        if (index + outcomeFunc.lookback >= data.length) {
          return; // not enough data
        }

        // Trigger has been found, now iterate from this point to end of data looking for outcome
        // TODO: Fix this need for entire lookback - should only be if new series or something smarter
        for (let i = index + outcomeFunc.lookback; i < data.length; i++) {
          // Start from net position - if available
          // How much data do we need to pass / should this be cached per outcome?
          const outcomeData = data.slice(i - outcomeFunc.lookback, i);

          const reversedLookbackSeries = outcomeData.reverse();

          const wasSuccessful = outcomeFunc.func({ data: reversedLookbackSeries }, { value: data[i].close });

          if (wasSuccessful != null) {
            results.push({
              trigger: { id: triggerId, time: triggerTime },
              outcome: { time: data[i].time, wasSuccessful, offsetFromTrigger: i - index },
            });
            return; // TODO: Return actual values
          }
        }
      });
    });
  });

  return results;
}
