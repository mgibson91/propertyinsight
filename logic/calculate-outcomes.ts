import { OhlcData, UTCTimestamp } from 'lightweight-charts';
import { GenericData } from '@/app/(logic)/types';

export type ConsolidatedLineData = {
  time: UTCTimestamp;
} & { [keyof: string]: number };

export interface Outcome {
  type: 'success' | 'failure';
  text: string;
  trigger: {
    time: number;
    offset: number;
    value: number;
  };
  outcome: {
    time: number;
    offset: number;
    value: number;
  };
}

export function calculateOutcomes(input: {
  consolidatedSeries: GenericData[];
  triggers: { offset: number; time: number; text: string }[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  outcomeFunc: Function; // (data: ConsolidatedLineData[]) => boolean; })
}): { summary: { successCount: number; failCount: number; uncertainCount: number }; outcomes: Outcome[] } {
  const outcomes: Outcome[] = [];
  const summary = {
    successCount: 0,
    failCount: 0,
    uncertainCount: 0,
  };

  for (const trigger of input.triggers) {
    const index = input.consolidatedSeries.findIndex(({ time }) => time === trigger.time);
    if (index === -1) {
      continue;
    }

    const triggerData = input.consolidatedSeries[index];

    const outcome = calculateOutcome({
      // @ts-ignore - Mkae this be a configurable field that the trigger is displayed ons
      triggerValue: triggerData.close, // TODO: Update this to be stored on each successful trigger
      triggerOffset: index,
      triggerTime: triggerData.time,
      consolidatedSeries: input.consolidatedSeries,
      outcomeFunc: input.outcomeFunc,
    });

    if (outcome) {
      outcomes.push({
        ...outcome,
        text: trigger.text,
      });

      if (outcome.type === 'success') {
        summary.successCount++;
      } else if (outcome.type === 'failure') {
        summary.failCount++;
      } else {
        summary.uncertainCount++;
      }
    }
  }

  return { outcomes, summary };
}

export function calculateOutcome(input: {
  triggerValue: number;
  triggerOffset: number;
  triggerTime: number;
  consolidatedSeries: GenericData[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  outcomeFunc: Function; // (data: ConsolidatedLineData[]) => boolean; })
}): Omit<Outcome, 'text'> | null {
  const { triggerValue, triggerOffset, triggerTime, consolidatedSeries, outcomeFunc } = input;

  // TODO: Optimize the heck out of this once verified
  const dataPostTrigger = consolidatedSeries.slice(triggerOffset);

  // Check the outcome func for each entry and return if 'success' or 'failure'
  for (let i = 1; i < dataPostTrigger.length; i++) {
    const dataSlice = dataPostTrigger.slice(0, i);
    const reversedSeries = [...dataSlice].reverse();
    const result = outcomeFunc(reversedSeries, { value: triggerValue });

    if (result === 'success' || result === 'failure') {
      const outcomeTime = dataPostTrigger[i - 1].time;
      const outcomeValue = dataPostTrigger[i - 1].close;

      if (typeof outcomeValue !== 'number') {
        console.error('TODO: Handle non numeric conditions', outcomeValue);
        return null;
      }

      return {
        type: result,
        trigger: {
          time: triggerTime,
          offsetBetweenTriggerAndOutcome: triggerOffset,
          value: triggerValue,
        },
        outcome: {
          time: outcomeTime,
          offsetBetweenTriggerAndOutcome: i - 1,
          value: outcomeValue,
        },
      };
    }
  }

  return null;
}
