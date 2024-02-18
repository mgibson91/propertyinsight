'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function addBoardColumn(input: { id?: string; boardId: string; title: string }): Promise<void> {
  const { id, boardId, title } = input;
  const logger = getLogger('addBoardColumn', { id, boardId });

  const supabase = await createServerActionClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn('User not found');
    return redirect('/login');
  }

  logger.info('Adding column');

  try {
    const maxPosition = await db
      .selectFrom('board_columns')
      .select('position')
      .where('board_id', '=', boardId)
      .orderBy('position', 'desc')
      .limit(1)
      .execute();

    const newPosition = maxPosition[0] ? maxPosition[0].position + 1 : 0;

    await db
      .insertInto('board_columns')
      .values({
        ...(id && { id }),
        board_id: boardId,
        position: newPosition,
        title,
        creating_user_id: user.id,
      })
      .execute();

    logger.info('Board column added successfully');
  } catch (error) {
    logger.error('Error adding board column', error || {});
    throw error;
  }
}
