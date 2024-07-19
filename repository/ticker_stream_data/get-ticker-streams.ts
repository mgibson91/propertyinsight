'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';

export type TickerStreamModel = {
  id: string;
  createdAt: Date;
  ticker: string;
  source: string;
  period: string;
};

export async function getAllTickerStreams(): Promise<TickerStreamModel[]> {
  const logger = getLogger('getAllTickerStreams');

  logger.info('Fetching all ticker streams');

  try {
    const tickerStreams = await db
      .selectFrom('ticker_streams')
      .select(['id', 'created_at', 'ticker', 'source', 'period'])
      .orderBy('ticker', 'asc')
      .execute();

    logger.info('Successfully fetched all ticker streams', { tickerStreamsCount: tickerStreams.length });

    return tickerStreams.map(
      stream =>
        ({
          id: stream.id,
          createdAt: stream.created_at,
          ticker: stream.ticker,
          source: stream.source,
          period: stream.period,
        }) satisfies TickerStreamModel
    );
  } catch (error) {
    logger.error('Error fetching all ticker streams', { error });
    throw error;
  }
}
