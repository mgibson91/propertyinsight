import { getTickerStreamData } from '@/repository/ticker_stream_data/get-ticker-stream-data';

describe('Get Ticker Stream Data', () => {
  test('should fetch stream data', async () => {
    const data = await getTickerStreamData({
      source: 'binance',
      ticker: 'BTCUSDT',
      period: '1h',
      startTime: '2023-11-15T00:00:00.000Z',
      endTime: '2023-12-15T00:00:00.000Z',
      // startTime: '2024-07-01T00:00:00.000Z',
      // endTime: '2024-08-01T00:00:00.000Z',
    });

    expect(data).toEqual(expect.any(Array));
  });
});
