'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';

export async function deleteBoardColumn(columnId: string): Promise<void> {
  const logger = getLogger('deleteBoardColumn');

  try {
    const columnToDelete = await db
      .selectFrom('board_columns')
      .select(['id', 'board_id', 'position'])
      .where('id', '=', columnId)
      .execute();

    if (columnToDelete.length === 0) {
      throw new Error('Column not found');
    }

    const { board_id, position } = columnToDelete[0];

    await db.transaction().execute(async trx => {
      await trx.deleteFrom('board_columns').where('id', '=', columnId).execute();

      await trx
        .updateTable('board_columns')
        .set(eb => ({
          position: eb('position', '-', 1),
        }))
        .where('board_id', '=', board_id)
        .where('position', '>', position)
        .execute();
    });

    logger.info('Board column deleted successfully and positions updated');
  } catch (error) {
    logger.error('Error deleting board column', error || {});
    throw error;
  }
}
