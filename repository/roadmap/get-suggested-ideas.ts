'use server';

import { getLogger } from '@/utils/logging/logger';
import { db } from '@/repository/kysely-connection';
import { Idea } from '@/shared/suggested-ideas/types'; // Adjust this path to your Kysely setup

export async function getSuggestedIdeas(input: { boardId: string }): Promise<Idea[]> {
  const { boardId } = input;
  const logger = getLogger('getAllIdeasForBoardWithUserEmail');
  logger.info('Retrieving ideas for board', { boardId });

  try {
    // Select ideas and join with auth.users to get the user's email
    const ideas = await db
      .selectFrom('board_ideas')
      .innerJoin('auth.users', 'auth.users.id', 'board_ideas.requesting_user_id')
      .select([
        'board_ideas.id',
        'board_ideas.title',
        'board_ideas.description',
        'board_ideas.created_at',
        'board_ideas.requesting_user_id', // Selecting the user ID for the user object
        'auth.users.email', // Selecting the email from the joined users table
      ])
      .where('board_ideas.board_id', '=', boardId)
      .execute();

    // Return the retrieved ideas along with the user's email
    return ideas.map(idea => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      createdAt: new Date(idea.created_at),
      user: {
        email: idea.email as string,
        id: idea.requesting_user_id,
      },
    }));
  } catch (error) {
    console.error('Error retrieving ideas for board with user email:', error);
    throw error; // Rethrow or handle accordingly
  }
}
