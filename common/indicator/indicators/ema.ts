export function calculateEMA(dataArray: number[], period: number): number {
  // Start with an SMA for the first EMA value
  let sma = 0;
  for (let i = 0; i < period; i++) {
    sma += dataArray[i];
  }
  sma /= period;

  // Initial EMA value
  let ema = sma;

  // Weighting multiplier
  let multiplier = 2 / (period + 1);

  // Calculate the EMA for each day after the initial period
  for (let i = period; i < dataArray.length; i++) {
    ema = (dataArray[i] - ema) * multiplier + ema;
  }

  // Return only the most recent EMA value
  return ema;
}
