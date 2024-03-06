export function ema(dataArray: number[], unusedPeriod: number): number | null {
  if (dataArray.length < unusedPeriod) {
    return null;
  }

  // EMA assuming [0] is the most recent value
  const period = unusedPeriod;
  let ema = dataArray[0];
  for (let i = 1; i < period; i++) {
    ema = (2 * dataArray[i] + (period - 1) * ema) / (period + 1);
  }
  return ema;

  // // Start with an SMA for the first EMA value
  // let sma = 0;
  // for (let i = 0; i < period; i++) {
  //   sma += dataArray[i];
  // }
  // sma /= period;
  //
  // // Initial EMA value
  // let ema = sma;
  //
  // // Weighting multiplier
  // let multiplier = 2 / (period + 1);
  //
  // // Calculate the EMA for each day after the initial period
  // for (let i = period; i < dataArray.length; i++) {
  //   ema = (dataArray[i] - ema) * multiplier + ema;
  // }
  //
  // // Return only the most recent EMA value
  // return ema;
}
