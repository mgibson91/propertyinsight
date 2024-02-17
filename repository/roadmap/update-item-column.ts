'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';

export async function updateItemColumn(input: { itemId: string; newColumnId: string }): Promise<void> {
  const { itemId, newColumnId } = input;
  const logger = getLogger('updateItemColumn');

  try {
    // Update the column_id of the specified board_item
    const updateResult = await db
      .updateTable('board_items')
      .set({
        column_id: newColumnId,
      })
      .where('id', '=', itemId)
      .execute();

    // Check if the update was successful
    if (updateResult[0] && !updateResult[0].numUpdatedRows) {
      throw new Error(`Item with ID ${itemId} not found or unable to update.`);
    }

    logger.info(`Item ID ${itemId} moved to new column ID ${newColumnId} successfully.`);
  } catch (error) {
    logger.error('Error updating item column', error || {});
    throw error; // Rethrow the error for the caller to handle
  }
}
