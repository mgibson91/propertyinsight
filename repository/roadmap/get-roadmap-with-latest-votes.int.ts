import { getRoadmapWithLatestVotes } from '@/repository/roadmap/get-roadmap-with-latest-votes';

describe('get-roadmap-with-la', () => {
  test('should ', async () => {
    const votes = await getRoadmapWithLatestVotes();
    console.log(votes);
  });
});
