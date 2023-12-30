// src/utils/indicators.ts

// Calculate the Simple Moving Average (SMA) for a given period
export const calculateSMA = (data: number[], period: number): number[] => {
  const sma: number[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    sma.push(sum / period);
  }

  // Pad the beginning of the SMA array with `null` to keep the array length consistent
  return Array(period - 1)
    .fill(null)
    .concat(sma);
};

// Calculate the Relative Strength Index (RSI) for a given period
export const calculateRSI = (data: number[], period: number): number[] => {
  const rsi: number[] = [];
  const avgGain: number[] = [];
  const avgLoss: number[] = [];

  // First average gain and loss
  let gain = 0,
    loss = 0;
  for (let i = 1; i < period + 1; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) gain += change;
    else loss -= change;
  }
  avgGain.push(gain / period);
  avgLoss.push(loss / period);

  // Subsequent average gain and loss
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    avgGain.push(
      (avgGain[avgGain.length - 1] * (period - 1) + (change > 0 ? change : 0)) /
        period
    );
    avgLoss.push(
      (avgLoss[avgLoss.length - 1] * (period - 1) +
        (change < 0 ? -change : 0)) /
        period
    );
  }

  // Calculate RSI
  for (let i = 0; i < avgGain.length; i++) {
    const rs = avgGain[i] / avgLoss[i];
    rsi.push(100 - 100 / (1 + rs));
  }

  // Pad the beginning of the RSI array with `null` to keep the array length consistent
  return Array(period).fill(null).concat(rsi);
};
