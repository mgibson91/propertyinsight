import { OhlcData, Time } from 'lightweight-charts';
import { sma } from '@/logic/built-in-functions/sma';

const INITIAL_SERIES: OhlcData[] = new Array(100).fill(10).map(
  (val, i) =>
    ({
      time: i,
      close: i + val,
      open: i + val,
      high: i + val + 1,
      low: i + val - 1,
    }) as OhlcData
);

INITIAL_SERIES[5].high = 200;
INITIAL_SERIES[2].low = 3;

// Auto calculated length by latest user provided access - max (100)
// Assuming user has just specified low(20) and high(20) therefore 20 is passed in
function calculateChannel(
  data: OhlcData[],
  cache: { lowest?: number; highest?: number }
): {
  upperBand: number;
  lowerBand: number;
  lowest: number;
  highest: number;
  cache: { lowest: number; highest: number };
} {
  const highest = cache.highest ? Math.max(cache.highest, data[0].high) : data[0].high;
  const lowest = cache.lowest ? Math.min(cache.lowest, data[0].low) : data[0].low;

  return {
    upperBand:
      sma(
        data.map(d => d.high),
        data.length
      ) || 0,
    lowerBand:
      sma(
        data.map(d => d.low),
        data.length
      ) || 0,
    highest,
    lowest,
    cache: {
      highest,
      lowest,
    },
  };
}

// Auto calculated length by latest user provided access - max (100)
// Assuming user has just specified low(20) and high(20) therefore 20 is passed in
function userCalculateChannel(data: OhlcData[], cache: { lowest?: number; highest?: number }) {
  const funcStr = `
function sma(data, period) {
  if (data.length < period) {
    return null;
  }

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  return sum / period;
}
  
  const highest = cache.highest ? Math.max(cache.highest, data[0].high) : data[0].high;
  const lowest = cache.lowest ? Math.min(cache.lowest, data[0].low) : data[0].low;

  return {
    upperBand:
      sma(
        data.map(d => d.high),
        data.length
      ) || 0,
    lowerBand:
      sma(
        data.map(d => d.low),
        data.length
      ) || 0,
    highest,
    lowest,
    cache: {
      highest,
      lowest,
    },
  };
  `;

  const func = new Function('data', 'cache', funcStr);

  return func(data, cache);
}

function processBatches(batchSize: number, data: OhlcData[] = INITIAL_SERIES) {
  const batches: OhlcData[][] = [];
  // Adjust loop to increment by 1 for overlapping batches
  for (let i = 0; i < data.length - batchSize + 1; i++) {
    const batch = data.slice(i, i + batchSize);
    batches.push(batch);
  }

  const consolidatedResult: OhlcData[] = [];
  let cache = {};

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    // const { cache: cacheUpdate, ...indicatorData } = calculateChannel(batch, cache);
    const { cache: cacheUpdate, ...indicatorData } = userCalculateChannel(batch, cache);
    cache = { ...cache, ...cacheUpdate };

    consolidatedResult.push({
      ...data[i + batchSize - 1],
      ...indicatorData,
    });
  }

  // Prepend earlier data points to the result
  const prependData = data.slice(0, batchSize - 1);
  const results = prependData.concat(consolidatedResult);

  return results;
}

describe('new path', () => {
  let result: OhlcData<Time>[];
  let finalResult: any;

  beforeAll(() => {
    // Adjust the batchSize as needed
    const batchSize = 20; // Example batch size
    result = processBatches(batchSize);
    finalResult = result[INITIAL_SERIES.length - 1];
  });

  test('cache works', () => {
    expect(finalResult.highest).toBe(200);
    expect(finalResult.lowest).toBe(3);
  });

  test('result length', () => {
    expect(result.length).toBe(INITIAL_SERIES.length);
  });

  test('result', () => {
    expect(finalResult.upperBand).toBe(100.5);
    expect(finalResult.lowerBand).toBe(98.5);
  });
});
