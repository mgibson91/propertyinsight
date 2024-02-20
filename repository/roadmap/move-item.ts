'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';
import { Transaction, TransactionBuilder } from 'kysely';
import { DB } from '@/repository/kysely-types';

async function adjustItemPositions(db: Transaction<DB>, columnId: string, startPosition: number, adjustment: number) {
  await db
    .updateTable('board_items')
    .set(eb => ({
      position: eb('position', '+', adjustment),
    }))
    .where('column_id', '=', columnId)
    .where('position', '>=', startPosition)
    .execute();
}

export async function updateItemColumnAndPosition(input: {
  itemId: string;
  previousColumnId: string;
  previousPosition: number;
  newColumnId: string;
  newPosition: number;
}): Promise<void> {
  const { itemId, previousColumnId, previousPosition, newColumnId, newPosition } = input;
  const logger = getLogger('updateItemColumnAndPosition');

  try {
    await db.transaction().execute(async trx => {
      // Decrease positions in the previous column for items after the item being moved
      await adjustItemPositions(trx, previousColumnId, previousPosition, -1);

      // Increase positions in the new column for items at or after the new position
      await adjustItemPositions(trx, newColumnId, newPosition, 1);

      // Update the column and position for the item
      await trx
        .updateTable('board_items')
        .set({
          column_id: newColumnId,
          position: newPosition,
        })
        .where('id', '=', itemId)
        .execute();

      logger.info('Item column and position updated successfully');
    });
  } catch (error) {
    logger.error('Error updating item column and position', error || {});
    throw error; // Rethrow the error for the caller to handle
  }
}
