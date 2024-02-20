'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';

export async function updateColumnName(input: { columnId: string; name: string }): Promise<void> {
  const { columnId, name } = input;
  const logger = getLogger('updateColumnName', { columnId });

  try {
    await db.updateTable('board_columns').set({ title: name }).where('id', '=', columnId).execute();

    logger.info('Column name updated successfully');
  } catch (error) {
    logger.error('Error updating column name', error || {});
    throw error;
  }
}
