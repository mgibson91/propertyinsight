import { calculateOutcomes, calculateOutcome, Outcome } from './calculate-outcomes.ts';
import { ConsolidatedLineData } from "../App.tsx"; // Replace 'yourModule' with the actual module path

// Mocked data for testing
const consolidatedSeries: ConsolidatedLineData[] = [
  { time: 1, close: 10 },
  { time: 2, close: 15 },
  { time: 3, close: 12 },
  // Add more data as needed
];

describe('calculateOutcomes', () => {
  it('should calculate outcomes correctly', () => {
    const triggers = [
      { offset: 0, time: 1 }, // Example trigger data
      // Add more trigger data as needed
    ];

    // const outcomeFunc = (data: ConsolidatedLineData[]) => {
    const outcomeFunc = () => {
      // Implement your outcome function logic for testing
      // For testing purposes, you can return 'success' or 'failure'

      return 'success';
    };

    const outcomes: Outcome[] = calculateOutcomes({ consolidatedSeries, triggers, outcomeFunc });

    // Expectations based on your outcome function logic
    expect(outcomes).toEqual([
      {
        type: 'success',
        trigger: { time: 1, offset: 0, value: 10 }, // Adjust based on your mock data
        outcome: { time: 3, offset: 2, value: 12 }, // Adjust based on your mock data
      },
      // Add more expected outcomes as needed
    ]);
  });
});

describe('calculateOutcome', () => {
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

    const outcome: Outcome | null = calculateOutcome({
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
