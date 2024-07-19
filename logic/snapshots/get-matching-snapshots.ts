import { OutcomeEvent } from '@/logic/outcomes/calculate-outcome-events';
import { GenericData } from '@/app/(logic)/types';

export interface MatchingSnapshot {
  triggerTimestamp: number;
  outcomeTimestamp: number;
  data: GenericData[];
  offsetBetweenTriggerAndOutcome: number;
  wasSuccessful: boolean;
}

interface GetMatchingSnapshotsParams {
  data: GenericData[];
  outcomeEvents: OutcomeEvent[];
  historicalValues: number;
  futureValues: number;
}

export function getMatchingSnapshots({
  data,
  outcomeEvents,
  historicalValues,
  futureValues,
}: GetMatchingSnapshotsParams): MatchingSnapshot[] {
  return outcomeEvents
    .map(event => {
      const triggerIndex = data.findIndex(d => d.time === event.trigger.time);
      const outcomeIndex = data.findIndex(d => d.time === event.outcome.time);

      if (triggerIndex === -1 || outcomeIndex === -1) return null;

      const start = Math.max(0, triggerIndex - historicalValues);
      const end = Math.min(data.length, outcomeIndex + futureValues + 1);
      const snapshotData = data.slice(start, end);

      return {
        triggerTimestamp: event.trigger.time,
        outcomeTimestamp: event.outcome.time,
        wasSuccessful: event.outcome.wasSuccessful,
        data: snapshotData,
        offsetBetweenTriggerAndOutcome: event.outcome.offsetFromTrigger,
      };
    })
    .filter(snapshot => snapshot !== null) as MatchingSnapshot[];
}
