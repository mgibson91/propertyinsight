'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type RoadmapVoteInput = {
  itemId: string;
  count: number; // Users can vote multiples like in Medium
};

export async function recordBoardItemVote(voteInput: RoadmapVoteInput, correlationId?: string): Promise<void> {
  const supabase = await createServerActionClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const logger = getLogger('recordBoardItemVote', {
    correlationId,
    userId: user.id,
    itemId: voteInput.itemId,
    count: voteInput.count,
  });

  logger.info('Recording roadmap vote', voteInput);

  try {
    await db
      .insertInto('board_votes')
      .values({
        user_id: user.id,
        item_id: voteInput.itemId,
        count: voteInput.count,
      })
      .execute();

    logger.info('Roadmap vote recorded successfully');
  } catch (error) {
    logger.error('Error recording roadmap vote', error || {});
    throw error;
  }
}
