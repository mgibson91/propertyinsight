export function stddev(data: number[], period: number): number | null {
  if (data.length < period) {
    return null;
  }

  // First, calculate the mean (average) for the period
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  const mean = sum / period;

  // Then, calculate the squared differences from the mean
  let squaredDifferences = 0;
  for (let i = 0; i < period; i++) {
    squaredDifferences += Math.pow(data[i] - mean, 2);
  }

  // Finally, calculate the standard deviation
  const variance = squaredDifferences / (period - 1);
  return Math.sqrt(variance);
}

export const STDDEV_FUNCTION = `function stddev(data, period) {
  if (data.length < period) {
    return null;
  }

  // First, calculate the mean (average) for the period
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  const mean = sum / period;

  // Then, calculate the squared differences from the mean
  let squaredDifferences = 0;
  for (let i = 0; i < period; i++) {
    squaredDifferences += Math.pow(data[i] - mean, 2);
  }

  // Finally, calculate the standard deviation
  const variance = squaredDifferences / (period - 1);
  return Math.sqrt(variance);
}`;
