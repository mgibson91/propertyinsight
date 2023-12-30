// src/api/fetchCandles.ts
export interface CandleData {
  // Define the structure of your candle data here, e.g.:
  timestamp: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

const BASE_URL = 'https://api-pub.bitfinex.com/v2/';

export const fetchCandles = async (
  ticker: string,
  timeframe: string,
  start: number,
  end: number
): Promise<CandleData[]> => {
  const response = await fetch(
    `/api/candles/trade:${timeframe}:t${ticker}/hist?start=${start}&end=${end}&sort=1`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const rawData = await response.json();

  return rawData.map(
    (candle: number[]): CandleData => ({
      timestamp: candle[0],
      open: candle[1],
      close: candle[2],
      high: candle[3],
      low: candle[4],
      volume: candle[5],
    })
  );
};
