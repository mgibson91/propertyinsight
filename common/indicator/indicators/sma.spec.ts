import { sma } from './sma';

describe('sma', () => {
  test('calculates simple moving average for a period within array length', () => {
    const data = [10, 20, 30, 40, 50];
    const period = 3;
    const expectedSMA = (10 + 20 + 30) / 3;
    expect(sma(data, period)).toEqual(expectedSMA);
  });

  test('calculates simple moving average for a period equal to array length', () => {
    const data = [15, 25, 35];
    const period = 3;
    const expectedSMA = (15 + 25 + 35) / 3;
    expect(sma(data, period)).toEqual(expectedSMA);
  });

  test('handles empty array input', () => {
    const data: number[] = [];
    const period = 3;
    expect(sma(data, period)).toBeNull();
  });

  test('handles array length less than period', () => {
    const data = [60, 70];
    const period = 3;
    expect(sma(data, period)).toBeNull();
  });
});
