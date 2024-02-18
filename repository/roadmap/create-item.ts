'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface CreateItemProps {
  id?: string;
  columnId: string;
  title: string;
}

export async function createItem({ id, columnId, title }: CreateItemProps) {
  const logger = getLogger('createItem', { columnId });

  const supabase = await createServerActionClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn('User not found');
    return redirect('/login');
  }

  logger.info('Creating item');

  try {
    // Find the last position in the column
    const lastItem = await db
      .selectFrom('board_items')
      .select('position')
      .where('column_id', '=', columnId)
      .orderBy('position', 'desc')
      .limit(1)
      .execute();

    const newPosition = lastItem.length > 0 ? lastItem[0].position + 1 : 0;

    // Insert new item at the new position
    const result = await db
      .insertInto('board_items')
      .values({
        ...(id && { id }),
        creating_user_id: user.id,
        column_id: columnId,
        title: title,
        position: newPosition,
      })
      .execute();

    return result[0].insertId as unknown as string;

    logger.info('Item created successfully');
  } catch (error) {
    logger.error('Error creating item', error || {});
    throw error;
  }
}
