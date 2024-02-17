import { getHydratedBoard } from '@/repository/roadmap/get-hydrated-board';

describe.only('get-hydrated-board', () => {
  test('should ', async () => {
    const votes = await getHydratedBoard('roadmap');
    console.log(votes);
  });
});
