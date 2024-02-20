'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';

export async function deleteBoardItem({ itemId }: { itemId: string }) {
  const logger = getLogger('deleteItem');

  try {
    // Get the item to be deleted to know its position and column_id
    const itemToDelete = await db
      .selectFrom('board_items')
      .select(['position', 'column_id'])
      .where('id', '=', itemId)
      .execute();

    if (itemToDelete.length === 0) {
      throw new Error('Item not found');
    }

    const { position, column_id } = itemToDelete[0];

    // Delete the item
    await db.deleteFrom('board_items').where('id', '=', itemId).execute();

    // Decrement positions of items above the deleted item's position
    await db
      .updateTable('board_items')
      .set(eb => ({
        position: eb('position', '-', 1),
      }))
      .where('column_id', '=', column_id)
      .where('position', '>', position)
      .execute();

    logger.info('Item deleted successfully and positions updated');
  } catch (error) {
    logger.error('Error deleting item or updating positions', error || {});
    throw error;
  }
}
