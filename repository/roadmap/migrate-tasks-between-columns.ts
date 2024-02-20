'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';

export async function migrateTasksBetweenColumns(input: { fromColumnId: string; toColumnId: string }): Promise<void> {
  const { fromColumnId, toColumnId } = input;
  const logger = getLogger('migrateTasks', input);

  logger.info('Migrating tasks between columns');

  try {
    // Begin a transaction to ensure data consistency
    await db.transaction().execute(async trx => {
      // Retrieve all tasks from the source column, ordered by their current position
      const tasksToMigrate = await trx
        .selectFrom('board_items')
        .select(['id', 'position'])
        .where('column_id', '=', fromColumnId)
        .orderBy('position')
        .execute();

      if (tasksToMigrate.length === 0) {
        logger.info('No tasks to migrate');
        return;
      }

      // Find the maximum position in the target column to append tasks at the end
      const maxPositionResult = await trx
        .selectFrom('board_items')
        .select(({ fn, val, ref }) => [fn.max<number>('position').as('max_position')])
        .where('column_id', '=', toColumnId)
        .execute();

      let newPositionStart = maxPositionResult[0].max_position !== null ? maxPositionResult[0].max_position + 1 : 0;

      // Update each task to the new column and assign a new position
      for (const task of tasksToMigrate) {
        await trx
          .updateTable('board_items')
          .set({
            column_id: toColumnId,
            position: newPositionStart++,
          })
          .where('id', '=', task.id)
          .execute();
      }

      logger.info('Tasks migrated successfully');
    });
  } catch (error) {
    logger.error('Error migrating tasks', error || {});
    throw error;
  }
}
