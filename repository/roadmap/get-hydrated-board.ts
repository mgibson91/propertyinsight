import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';
import { sql } from 'kysely';
import { Board } from '@/repository/roadmap/types';

export async function getHydratedBoard(boardName: string, correlationId?: string): Promise<Board | null> {
  const logger = getLogger('getBoardHierarchy', { correlationId });
  logger.info('Fetching board hierarchy');

  const allColumns = await db
    .selectFrom('board_columns')
    .select(['id', 'title', 'position', 'board_id'])
    .where('board_id', '=', db.selectFrom('boards').select('id').where('name', '=', boardName))
    .orderBy('position')
    .execute();

  try {
    const rawQuery = sql`
      SELECT
    rm.id AS board_id,
    rm.name AS board_name,
    rmc.id AS board_column_id,
    rmc.title AS board_column_title,
    rmc.position AS board_column_order,
    rmi.id AS board_item_id,
    rmi.position AS board_item_position,
    rmi.title AS board_item_title,
    rmi.created_at AS board_item_created_at,
    COALESCE(SUM(rmv.count), 0) AS total_votes,
    COUNT(DISTINCT rmv.user_id) AS unique_voters
FROM boards rm
JOIN board_columns rmc ON rm.id = rmc.board_id
JOIN board_items rmi ON rmc.id = rmi.column_id
LEFT JOIN
    board_votes rmv ON rmi.id = rmv.item_id
WHERE
    rm.name = ${boardName}
GROUP BY
    rm.id, rmc.id, rmi.id
ORDER BY
    rmc.position, rmi.created_at;

    `;

    const { rows: results } = await rawQuery.execute(db);

    // Process results into hierarchical structure
    const boards = results.reduce<Board[]>((acc, row: any) => {
      let board = acc.find(rm => rm.id === row.board_id);
      if (!board) {
        board = { id: row.board_id, name: row.board_name, columns: [] };
        acc.push(board);
      }

      let column = board.columns.find(col => col.id === row.board_column_id);
      if (!column) {
        column = {
          id: row.board_column_id,
          title: row.board_column_title,
          position: row.board_column_order,
          items: [],
        };
        board.columns.push(column);
      }

      column.items.push({
        id: row.board_item_id,
        title: row.board_item_title,
        createdAt: new Date(row.board_item_created_at),
        totalVotes: Number(row.total_votes),
        uniqueVoters: Number(row.unique_voters),
        position: row.board_item_position,
      });

      return acc;
    }, []);

    const board = boards.length ? boards[0] : null;
    if (!board) {
      return null;
    }

    allColumns.forEach(col => {
      const column = board.columns.find(c => c.id === col.id);
      if (!column) {
        board.columns.push({
          id: col.id,
          title: col.title,
          position: col.position,
          items: [],
        });
      }
    });

    board.columns = board.columns.sort((a, b) => a.position - b.position);

    return board;
  } catch (error) {
    logger.error('Error processing board hierarchy', error || {});
    throw error;
  }
}
