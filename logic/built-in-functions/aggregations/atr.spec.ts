import { atr, ATR_FUNCTION } from '@/logic/built-in-functions/aggregations/atr';
import { prependSpreadFunctions } from '@/logic/get-consolidated-series-new';

const DATA = [
  { high: 150, low: 140, close: 145 },
  { high: 152, low: 142, close: 148 },
  { high: 155, low: 146, close: 153 },
  { high: 158, low: 149, close: 157 },
  { high: 160, low: 152, close: 155 },
  { high: 156, low: 146, close: 150 },
  { high: 152, low: 142, close: 147 },
  { high: 148, low: 139, close: 144 },
  { high: 145, low: 135, close: 140 },
  { high: 142, low: 132, close: 138 },
  { high: 139, low: 129, close: 135 },
  { high: 142, low: 133, close: 139 },
  { high: 145, low: 137, close: 143 },
  { high: 148, low: 140, close: 146 },
];

const length = 14;
const expectedATR = 9.285;

describe('atr', () => {
  test('code function', () => {
    const result = atr(DATA, length);
    expect(result).toBeCloseTo(expectedATR, 1);
  });

  test('string function', () => {
    const completeFuncString = prependSpreadFunctions({
      funcString: `${ATR_FUNCTION}
      return atr(length);`,
      existingIndicatorMetadata: [],
    });

    const func = new Function('data', 'length', completeFuncString);

    const atr = func(DATA, length);

    expect(atr).toBeCloseTo(expectedATR, 1);
  });
});
