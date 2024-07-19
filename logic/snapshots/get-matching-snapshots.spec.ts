import { getMatchingSnapshots, MatchingSnapshot } from './get-matching-snapshots';
import { GenericData } from '@/app/(logic)/types';
import { OutcomeEvent } from '@/logic/outcomes/calculate-outcome-events';
import { UTCTimestamp } from 'lightweight-charts'; // Adjust the import path

describe('getMatchingSnapshots', () => {
  it('should return the correct snapshots', () => {
    const data: GenericData[] = [
      { time: 1 as UTCTimestamp, value: 10 },
      { time: 2 as UTCTimestamp, value: 20 },
      { time: 3 as UTCTimestamp, value: 30 },
      { time: 4 as UTCTimestamp, value: 40 },
      { time: 5 as UTCTimestamp, value: 50 },
    ];

    const outcomeEvents: OutcomeEvent[] = [
      {
        trigger: { id: 'a', time: 2 as UTCTimestamp },
        outcome: { time: 4 as UTCTimestamp, wasSuccessful: true, offsetFromTrigger: 2 },
      },
    ];

    const historicalValues = 1;
    const futureValues = 1;

    const result = getMatchingSnapshots({
      data,
      outcomeEvents,
      historicalValues,
      futureValues,
    });

    expect(result).toEqual([
      {
        triggerTimestamp: 2,
        outcomeTimestamp: 4,
        data: [
          { time: 1 as UTCTimestamp, value: 10 },
          { time: 2 as UTCTimestamp, value: 20 },
          { time: 3 as UTCTimestamp, value: 30 },
          { time: 4 as UTCTimestamp, value: 40 },
          { time: 5 as UTCTimestamp, value: 50 },
        ],
        offsetBetweenTriggerAndOutcome: 2,
        wasSuccessful: true,
      } satisfies MatchingSnapshot,
    ]);
  });

  it('should handle no matching trigger', () => {
    const data: GenericData[] = [
      { time: 1 as UTCTimestamp, value: 10 },
      { time: 2 as UTCTimestamp, value: 20 },
      { time: 3 as UTCTimestamp, value: 30 },
      { time: 4 as UTCTimestamp, value: 40 },
      { time: 5 as UTCTimestamp, value: 50 },
    ];

    const outcomeEvents: OutcomeEvent[] = [
      {
        trigger: { id: 'a', time: 6 as UTCTimestamp },
        outcome: { time: 7 as UTCTimestamp, wasSuccessful: true, offsetFromTrigger: 1 },
      },
    ];

    const historicalValues = 1;
    const futureValues = 1;

    const result = getMatchingSnapshots({
      data,
      outcomeEvents,
      historicalValues,
      futureValues,
    });

    expect(result).toEqual([]);
  });

  it('should handle historicalValues and futureValues correctly at the boundaries', () => {
    const data: GenericData[] = [
      { time: 1 as UTCTimestamp, value: 10 },
      { time: 2 as UTCTimestamp, value: 20 },
      { time: 3 as UTCTimestamp, value: 30 },
      { time: 4 as UTCTimestamp, value: 40 },
      { time: 5 as UTCTimestamp, value: 50 },
    ];

    const outcomeEvents: OutcomeEvent[] = [
      {
        trigger: { id: 'a', time: 1 as UTCTimestamp },
        outcome: { time: 3 as UTCTimestamp, wasSuccessful: true, offsetFromTrigger: 2 },
      },
    ];

    const historicalValues = 2;
    const futureValues = 2;

    const result = getMatchingSnapshots({
      data,
      outcomeEvents,
      historicalValues,
      futureValues,
    });

    expect(result).toEqual([
      {
        triggerTimestamp: 1,
        outcomeTimestamp: 3,
        data: [
          { time: 1 as UTCTimestamp, value: 10 },
          { time: 2 as UTCTimestamp, value: 20 },
          { time: 3 as UTCTimestamp, value: 30 },
          { time: 4 as UTCTimestamp, value: 40 },
          { time: 5 as UTCTimestamp, value: 50 },
        ],
        offsetBetweenTriggerAndOutcome: 2,
        wasSuccessful: true,
      },
    ] satisfies MatchingSnapshot[]);
  });
});
