export function sma(data: number[], period: number): number | null {
  if (data.length < period) {
    return null;
  }

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  return sum / period;
}
