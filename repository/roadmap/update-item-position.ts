'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';
import { sql } from 'kysely';

export async function updateItemPosition(input: {
  boardId: string;
  columnId: string;
  itemId: string;
  newPosition: number;
}): Promise<void> {
  const { boardId, columnId, itemId, newPosition } = input;
  const logger = getLogger('updateItemPosition');

  try {
    // Fetch all items for the column
    let items = await db
      .selectFrom('board_items')
      .select(['id', 'position']) // Assuming 'content' is a relevant field to select
      .where('column_id', '=', columnId)
      .orderBy('position')
      .execute();

    // Find the index of the item to move
    const currentIndex = items.findIndex(item => item.id === itemId);
    if (currentIndex === -1) {
      throw new Error(`Item with ID ${itemId} not found.`);
    }

    // Remove the item from its current position
    const [itemToMove] = items.splice(currentIndex, 1);

    // Splice the item back into the array at the new position
    items.splice(newPosition, 0, itemToMove);

    // Filter out items that haven't changed position
    const updatedItems = items.filter((item, index) => item.position !== index);

    // Construct the values list for the SQL query
    const valuesList: string = updatedItems.map(item => `('${item.id}'::uuid, ${items.indexOf(item)})`).join(', ');

    // Only proceed if there are items to update
    if (valuesList) {
      try {
        await sql`
UPDATE board_items AS bi SET
position = i.new_position
FROM (VALUES
    ${sql.raw(valuesList)}
) AS i(id, new_position)
  WHERE i.id = bi.id AND bi.column_id = ${columnId}`.execute(db);
      } catch (error) {
        logger.error('Error updating item positions', error || {});
        throw error;
      }

      logger.info(`Item positions updated successfully.`);
    }
  } catch (error) {
    logger.error('Error updating item positions', error || {});
    throw error; // Rethrow the error for the caller to handle
  }
}
