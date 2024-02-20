'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';

export type VoteSummary = {
  totalVotes: number;
  averageVotesPerUser: number;
  userDetails: Array<{
    email: string;
    votes: number;
  }>;
};

export async function getItemVoteSummary(itemId: string): Promise<VoteSummary> {
  const logger = getLogger('getItemVoteSummary');

  try {
    // Get summed votes per user
    const userVotes = await db
      .selectFrom('board_votes')
      .leftJoin('auth.users', 'auth.users.id', 'board_votes.user_id')
      .select(({ fn, val, ref }) => ['auth.users.email as email', fn.sum<number>('count').as('votes')])
      .where('board_votes.item_id', '=', itemId)
      .groupBy('auth.users.email')
      .execute();

    if (userVotes.length === 0) {
      return { totalVotes: 0, averageVotesPerUser: 0, userDetails: [] };
    }

    // Calculate total votes by summing all votes across users
    const totalVotes = userVotes.reduce((acc, curr) => acc + Number(curr.votes), 0);

    // Calculate the average votes per user
    const averageVotesPerUser = userVotes.length > 0 ? totalVotes / userVotes.length : 0;

    const userDetails = userVotes.map(user => ({
      email: user.email,
      votes: user.votes,
    }));

    const result: VoteSummary = {
      totalVotes: totalVotes,
      averageVotesPerUser: averageVotesPerUser,
      userDetails: userDetails as any,
    };

    return result;
  } catch (error) {
    logger.error('Error retrieving item vote summary', error || {});
    throw error;
  }
}
