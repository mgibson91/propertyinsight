'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';
import { sql } from 'kysely';

export async function updateColumnPosition(input: {
  boardId: string;
  columnId: string;
  newPosition: number;
}): Promise<void> {
  const { boardId, columnId, newPosition } = input;
  const logger = getLogger('updateColumnPosition');

  try {
    // Fetch all columns for the board
    let columns = await db
      .selectFrom('board_columns')
      .select(['id', 'position', 'title'])
      .where('board_id', '=', boardId)
      .orderBy('position')
      .execute();

    // Find the index of the column to move
    const currentIndex = columns.findIndex(col => col.id === columnId);
    if (currentIndex === -1) {
      throw new Error(`Column with ID ${columnId} not found.`);
    }

    // Remove the column from its current position
    const [columnToMove] = columns.splice(currentIndex, 1);

    // Splice the column back into the array at the new position
    columns.splice(newPosition, 0, columnToMove);

    // Filter out columns that haven't changed position
    const updatedColumns = columns.filter((col, index) => col.position !== index);

    // Construct the values list for the SQL query
    const valuesList: string = updatedColumns.map(col => `('${col.id}'::uuid, ${columns.indexOf(col)})`).join(', ');

    // Only proceed if there are columns to update
    if (valuesList) {
      try {
        await sql`
UPDATE board_columns AS bc SET
position = c.new_position
FROM (VALUES
    ${sql.raw(valuesList)}
) AS c(id, new_position)
  WHERE c.id = bc.id AND bc.board_id = ${boardId}`.execute(db);
      } catch (error) {
        logger.error('Error updating column positions', error || {});
        throw error;
      }

      logger.info(`Column positions updated successfully.`);
    }
  } catch (error) {
    logger.error('Error updating column positions', error || {});
    throw error; // Rethrow the error for the caller to handle
  }
}
