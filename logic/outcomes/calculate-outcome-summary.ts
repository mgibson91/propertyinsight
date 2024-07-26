import { PossibleOutcomeEvent } from '@/logic/outcomes/calculate-outcome-events';

export function calculateOutcomeSummary(outcome: PossibleOutcomeEvent[]): {
  successCount: number;
  failCount: number;
  unresolvedCount: number;
} {
  const summary = {
    successCount: 0,
    failCount: 0,
    unresolvedCount: 0,
  };

  for (const event of outcome) {
    if (!event.outcome) {
      summary.unresolvedCount++;
      continue;
    }
    if (event.outcome.delta > 0) {
      summary.successCount++;
    } else if (event.outcome.delta <= 0) {
      summary.failCount++;
    } else {
      summary.unresolvedCount++;
    }
  }

  return summary;
}
