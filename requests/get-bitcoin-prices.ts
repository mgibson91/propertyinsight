import { CandleData } from "@/requests/fetch-candles";
import { HISTORICAL_BITCOIN_DATA_HOURLY } from "@/example-data/hourly-bitcoin";

export const fetchCandlesFromMemory = async (
  ticker: string,
  timeframe: string,
  start: number,
  end: number
): Promise<CandleData[]> => {
  const startUnix = new Date(start).getTime();
  const endUnix = new Date(end).getTime();

  // Filter the candles based on the timeframe, start, and end. This example assumes you are handling 'hourly' data.
  const filteredCandles = HISTORICAL_BITCOIN_DATA_HOURLY.filter(candle =>
    candle.unix >= startUnix && candle.unix <= endUnix
  );
  // const filteredCandles = HISTORICAL_BITCOIN_DATA_HOURLY

  // Map the filtered data to fit the CandleData structure
  return filteredCandles.map(candle => ({
    timestamp: candle.unix,
    open: candle.open,
    close: candle.close,
    high: candle.high,
    low: candle.low,
    volume: candle.volume_usd, // or volume_btc depending on your need
  })).sort((a, b) => a.timestamp - b.timestamp);
};