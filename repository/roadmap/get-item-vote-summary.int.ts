import { getItemVoteSummary } from '@/repository/roadmap/get-item-vote-summary';

describe('get-item-vote-summary', () => {
  test('should ', async () => {
    const votes = await getItemVoteSummary('64eb1893-600a-49a3-8006-1a6f752752d7');
    console.log(votes);
  });
});
