'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';

export type BoardItemUpdateInput = {
  itemId: string; // Unique identifier for the board item
  title: string; // New title for the board item
};

export async function updateBoardItemTitle(updateInput: BoardItemUpdateInput, correlationId?: string): Promise<void> {
  const logger = getLogger('updateBoardItemTitle', {
    correlationId,
    itemId: updateInput.itemId,
  });

  logger.info('Updating board item title', updateInput);

  try {
    await db
      .updateTable('board_items')
      .set({
        title: updateInput.title, // Sets the new title
      })
      .where('id', '=', updateInput.itemId) // Identifies the specific board item to update
      .execute();

    logger.info('Board item title updated successfully');
  } catch (error) {
    logger.error('Error updating board item title', error || {});
    throw error;
  }
}
