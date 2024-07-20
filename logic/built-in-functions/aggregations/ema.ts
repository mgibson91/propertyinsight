export function ema(dataArray: number[], period: number): number | null {
  if (dataArray.length < period) {
    return null;
  }

  // EMA assuming [0] is the most recent value
  let ema = dataArray[0];
  for (let i = 1; i < period; i++) {
    ema = (2 * dataArray[i] + (period - 1) * ema) / (period + 1);
  }
  return ema;
}

export const EMA_FUNCTION = `function ema(dataArray, period) {
  if (dataArray.length < period) {
    return null;
  }

  // EMA assuming [0] is the most recent value
  let ema = dataArray[0];
  for (let i = 1; i < period; i++) {
    ema = (2 * dataArray[i] + (period - 1) * ema) / (period + 1);
  }
  return ema;
}`;
