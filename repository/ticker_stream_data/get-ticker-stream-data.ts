'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';
import { CandleData } from '@/requests/fetch-candles';

interface GetStreamDataInput {
  source: string;
  ticker: string;
  period: string;
  startTime: string; // ISO string format
  endTime: string; // ISO string format
}

export async function getTickerStreamData(input: GetStreamDataInput): Promise<CandleData[]> {
  const { source, ticker, period, startTime, endTime } = input;
  const logger = getLogger('getStreamData', input);

  logger.info('Fetching stream data');

  try {
    // First, fetch the stream_id from the ticker_streams table
    const stream = await db
      .selectFrom('ticker_streams')
      .select(['id'])
      .where('source', '=', source)
      .where('ticker', '=', ticker)
      .where('period', '=', period)
      .executeTakeFirst();

    if (!stream) {
      logger.error('Stream not found for the provided source, ticker, and period');
      throw new Error('Stream not found');
    }

    const streamId = stream.id;

    // Fetch the stream data from the ticker_stream_data table
    const streamData = await db
      .selectFrom('ticker_stream_data')
      .select(['timestamp', 'open', 'close', 'high', 'low', 'volume_usd as volume'])
      .where('stream_id', '=', streamId)
      .where('timestamp', '>=', new Date(startTime).getTime() as any)
      .where('timestamp', '<=', new Date(endTime).getTime() as any)
      .orderBy('timestamp', 'asc')
      .execute();

    logger.info('Successfully fetched stream data', { streamDataCount: streamData.length });

    return streamData as unknown as CandleData[];
  } catch (error) {
    logger.error('Error fetching stream data', { error });
    throw error;
  }
}
