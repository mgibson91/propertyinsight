import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';
import { sql } from 'kysely';

type RoadmapItemWithCounts = {
  id: string;
  title: string;
  createdAt: Date;
  count: number; // Aggregate of votes
  voterCount: number; // Count of distinct voters
};

export async function getRoadmapWithLatestVotes(correlationId?: string): Promise<RoadmapItemWithCounts[]> {
  const logger = getLogger('getRoadmapWithLatestVotes', { correlationId });

  logger.info('Fetching all roadmap items and aggregating counts and voter counts');

  try {
    const rawQuery = sql<{ id: string; title: string; created_at: Date; count: number; voterCount: number }>`
      SELECT
        ri.id,
        ri.title,
        ri.created_at,
        COALESCE(SUM(rv.count), 0) AS count,
        COUNT(DISTINCT rv.user_id) AS voterCount
      FROM
        roadmap_items ri
      LEFT JOIN
        roadmap_votes rv
      ON
        ri.id = rv.item_id
      GROUP BY
        ri.id;
    `;

    const { rows: itemsWithCounts } = await rawQuery.execute(db);

    logger.info('Successfully fetched and aggregated counts and voter counts for roadmap items');
    return itemsWithCounts.map(item => ({
      id: item.id,
      title: item.title,
      createdAt: new Date(item.created_at), // Ensuring createdAt is a Date object
      count: Number(item.count), // Total vote count
      voterCount: Number(item.voterCount), // Total distinct voter count
    })) satisfies RoadmapItemWithCounts[];
  } catch (error) {
    logger.error('Error fetching roadmap items and aggregating counts and voter counts', error || {});
    throw error;
  }
}
