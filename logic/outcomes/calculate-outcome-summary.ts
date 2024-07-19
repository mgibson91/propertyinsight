import { OutcomeEvent } from '@/logic/outcomes/calculate-outcome-events';

export function calculateOutcomeSummary(outcome: OutcomeEvent[]): {
  successCount: number;
  failCount: number;
  uncertainCount: number;
} {
  const summary = {
    successCount: 0,
    failCount: 0,
    uncertainCount: 0,
  };

  for (const event of outcome) {
    if (event.outcome.wasSuccessful === true) {
      summary.successCount++;
    } else if (event.outcome.wasSuccessful === false) {
      summary.failCount++;
    } else {
      summary.uncertainCount++;
    }
  }

  return summary;
}
