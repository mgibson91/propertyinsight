import { ema } from '@/logic/built-in-functions/ema';

describe('ema', () => {
  test('calculates simple moving average for a period within array length', () => {
    const data = [10, 20, 30, 40, 50];
    const period = 3;
    const expectedEMA = (10 + 20 + 30) / 3;
    expect(ema(data, period)).toEqual(expectedEMA);
  });

  test('calculates simple moving average for a period equal to array length', () => {
    const data = [15, 25, 35];
    const period = 3;
    const expectedEMA = (15 + 25 + 35) / 3;
    expect(ema(data, period)).toEqual(expectedEMA);
  });

  test('handles empty array input', () => {
    const data: number[] = [];
    const period = 3;
    expect(ema(data, period)).toBeNull();
  });

  test('handles array length less than period', () => {
    const data = [60, 70];
    const period = 3;
    expect(ema(data, period)).toBeNull();
  });
});
