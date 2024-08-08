import { PossibleOutcomeEvent, ResolvedOutcomeEvent } from '@/logic/outcomes/calculate-outcome-events';
import { GenericData } from '@/app/(logic)/types';

export interface MatchingSnapshot {
  triggerTimestamp: number;
  triggerOffset: number;
  outcomeTimestamp: number;
  outcomeOffset: number;
  data: GenericData[];
  offsetBetweenTriggerAndOutcome: number;
  wasSuccessful: boolean;
  outcomeEvent: ResolvedOutcomeEvent;
}

interface GetMatchingSnapshotsParams {
  data: GenericData[];
  outcomeEvents: PossibleOutcomeEvent[];
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
      if (event.outcome === null) return null;

      const triggerIndex = data.findIndex(d => d.time === event.trigger.time);
      const outcomeIndex = data.findIndex(d => d.time === event.outcome!.time);

      if (triggerIndex === -1 || outcomeIndex === -1) return null;

      const start = Math.max(0, triggerIndex - historicalValues);
      const end = Math.min(data.length, outcomeIndex + futureValues);
      const snapshotData = data.slice(start, end);

      return {
        triggerTimestamp: event.trigger.time,
        triggerOffset: triggerIndex,
        outcomeTimestamp: event.outcome!.time,
        outcomeOffset: outcomeIndex,
        wasSuccessful: event.outcome!.wasSuccessful,
        data: snapshotData,
        offsetBetweenTriggerAndOutcome: event.outcome!.offsetFromTrigger,
        outcomeEvent: event,
      };
    })
    .filter(snapshot => snapshot !== null) as MatchingSnapshot[];
}
