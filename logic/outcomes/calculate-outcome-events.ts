import { GenericData } from '@/app/(logic)/types';
import { UTCTimestamp } from 'lightweight-charts';
import { OutcomeConfig, OutcomeId } from '@/logic/outcomes/types';
import { TriggerId } from '@/components/triggers/edit-trigger';
import { buildOutcomeFunc } from '@/logic/outcomes/build-outcome-functions';
import { OPERATOR_LOOKBACK_MAP, TriggerEvent } from '@/logic/triggers/calculate-trigger-events';
import { IndicatorStreamMetadata, prependSpreadFunctions } from '@/logic/get-consolidated-series-new';
import { prefixBuiltInFunctions } from '@/logic/built-in-functions/aggregations/prefix-built-in-functions';

export type OutcomeEvent = {
  time: UTCTimestamp;
  wasSuccessful: boolean | null;
  offsetFromTrigger: number;
  delta: number;
  percDelta: number;
  data: GenericData;
};

export type PossibleOutcomeEvent = {
  trigger: TriggerEvent;
  outcome: OutcomeEvent | null;
};

export type ResolvedOutcomeEvent = {
  trigger: TriggerEvent;
  outcome: OutcomeEvent;
};

export type CalculateOutcomeEventsInput = {
  data: GenericData[];
  streams: IndicatorStreamMetadata[];
  triggerEvents: Record<TriggerId, TriggerEvent[]>;
  outcomeConfigs: OutcomeConfig[];
};

export function calculateOutcomeEvents(input: CalculateOutcomeEventsInput): PossibleOutcomeEvent[] {
  const { data, streams, triggerEvents, outcomeConfigs } = input;

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
      ...outcome.successConditions.map(condition => OPERATOR_LOOKBACK_MAP[condition.operator.type]),
    ].filter(l => l != null);

    // TODO: This will be harder in code...... perhaps a manditory variable
    const lookback = Math.max(
      outcome.successConditions.reduce((acc, condition) => {
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

  const earliestOutcomes = new Map<
    number,
    {
      trigger: TriggerEvent;
      outcome: OutcomeEvent;
    }
  >();
  const unresolvedOutcomes: PossibleOutcomeEvent[] = [];

  enabledOutcomeConfigs.map(outcome => {
    const outcomeFunc = outcomeFuncMap[outcome.id];

    Object.entries(triggerEvents).map(([triggerId, triggerEvent]) => {
      triggerEvent.map(({ time: triggerTime, occurrence, name: triggerName }) => {
        const triggerIdx = data.findIndex(({ time: dataTime }) => dataTime === triggerTime);
        if (triggerIdx === -1) {
          return;
        }

        if (triggerIdx + outcomeFunc.lookback >= data.length) {
          return; // not enough data
        }

        // Trigger has been found, now iterate from this point to end of data looking for outcome
        // TODO: Fix this need for entire lookback - should only be if new series or something smarter
        for (let i = triggerIdx + outcomeFunc.lookback; i < data.length; i++) {
          // Start from net position - if available
          // How much data do we need to pass / should this be cached per outcome?
          const outcomeData = data.slice(i - outcomeFunc.lookback, i);

          const reversedLookbackSeries = outcomeData.reverse();

          const triggerData = data[triggerIdx];

          const wasSuccessful = outcomeFunc.func(reversedLookbackSeries, { close: triggerData.close });
          const delta = (data[i - outcomeFunc.lookback].close as number) - (triggerData.close as number);

          if (wasSuccessful != null) {
            // Check if earlier outcome exists
            const earlierOutcome = earliestOutcomes.get(occurrence);
            if (earlierOutcome && earlierOutcome.outcome.time > data[i - outcomeFunc.lookback].time) {
              return;
            }

            earliestOutcomes.set(occurrence, {
              trigger: { id: triggerId, time: triggerTime, name: triggerName, data: triggerData, occurrence },
              // NOTE: This is based on close price for now
              outcome: {
                time: data[i - outcomeFunc.lookback].time,
                wasSuccessful,
                offsetFromTrigger: i - triggerIdx,
                delta,
                percDelta: (delta / (triggerData.close as number)) * 100,
                data: data[i - outcomeFunc.lookback],
              },
            });
            return; // TODO: Return actual values
          }
        }

        if (
          !earliestOutcomes.has(occurrence) &&
          !unresolvedOutcomes.find(({ trigger }) => trigger.occurrence === occurrence)
        ) {
          unresolvedOutcomes.push({
            trigger: { id: triggerId, time: triggerTime, name: triggerName, data: data[triggerIdx], occurrence },
            outcome: null,
          });
        }
      });
    });
  });

  const results: PossibleOutcomeEvent[] = [...Array.from(earliestOutcomes.values()), ...unresolvedOutcomes];

  return results;
}
