'use server';

// Assuming you have a utility function to get your Supabase client
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLogger } from '@/utils/logging/logger';
import { db } from '@/repository/kysely-connection';

export async function submitIdea(input: { boardId: string; title: string; description: string }) {
  const { boardId, title, description } = input;
  const supabase = await createServerActionClient({ cookies });

  const logger = getLogger('submitIdea');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn('User not found');
    return redirect('/login');
  }

  logger.info('Submitting idea', { userId: user.id });

  try {
    // Insert the new idea into the board_ideas table
    const insertResult = await db
      .insertInto('board_ideas')
      .values({
        board_id: boardId,
        title: title,
        description: description,
        requesting_user_id: user.id, // Assuming the column in your table is named user_id
        created_at: new Date(), // Assuming you have a created_at column for timestamps
      })
      // .returning('id') // Assuming you want to return the ID of the inserted idea
      .execute();

    // // Since Kysely is type-safe, you should not get an error object like in Supabase
    // // Instead, check the insertResult for success/failure
    // if (insertResult.length === 0) {
    //   // Handle the case where the insert didn't return anything
    //   throw new Error('Failed to submit idea');
    // }
    //
    // // Return the inserted data or some success message
    // return insertResult[0]; // Adjust based on what you actually want to return
  } catch (error) {
    // Log the error or handle it as needed
    console.error('Error submitting idea:', error);
    throw error; // Rethrow or handle accordingly
  }
}
