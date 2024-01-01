import { calculateOutcomes, calculateOutcome, Outcome, ConsolidatedLineData } from './calculate-outcomes';
import { UTCTimestamp } from "lightweight-charts";

// Mocked data for testing
const consolidatedSeries: ConsolidatedLineData[] = [
  { time: 1 as UTCTimestamp, close: 10 },
  { time: 2 as UTCTimestamp, close: 15 },
  { time: 3 as UTCTimestamp, close: 12 },
  // Add more data as needed
];

describe.skip('calculateOutcomes', () => {
  it('should calculate outcomes correctly', () => {
    const triggers = [
      { offset: 0, time: 1, text: '1' }, // Example trigger data
      // Add more trigger data as needed
    ];

    // const outcomeFunc = (data: ConsolidatedLineData[]) => {
    const outcomeFunc = () => {
      // Implement your outcome function logic for testing
      // For testing purposes, you can return 'success' or 'failure'

      return 'success';
    };

    const outcomes: { summary: { successCount: number; failCount: number; uncertainCount: number }; outcomes: Outcome[] } = calculateOutcomes({ consolidatedSeries, triggers, outcomeFunc });

    // Expectations based on your outcome function logic
    expect(outcomes).toEqual([
      {
        type: 'success',
        trigger: { time: 1 as UTCTimestamp, offset: 0, value: 10 }, // Adjust based on your mock data
        outcome: { time: 3 as UTCTimestamp, offset: 2, value: 12 }, // Adjust based on your mock data
      },
      // Add more expected outcomes as needed
    ]);
  });
});

describe.skip('calculateOutcome', () => {
  it('should calculate outcome correctly', () => {
    const triggerValue = 10;
    const triggerOffset = 0;
    const triggerTime = 1;

    // const outcomeFunc = (data: ConsolidatedLineData[]) => {
    const outcomeFunc = () => {
      // Implement your outcome function logic for testing
      // For testing purposes, you can return 'success' or 'failure'
      return 'success';
    };

    const outcome: Omit<Outcome, 'text'> | null = calculateOutcome({
      triggerValue,
      triggerOffset,
      triggerTime,
      consolidatedSeries,
      outcomeFunc,
    });

    // Expectations based on your outcome function logic
    expect(outcome).toEqual({
      type: 'success',
      trigger: { time: 1, offset: 0, value: 10 }, // Adjust based on your mock data
      outcome: { time: 3, offset: 2, value: 12 }, // Adjust based on your mock data
    });
  });
});
