import { getConsolidatedSeries, IndicatorStreamData } from '@/app/(logic)/get-consolidated-series';
import { OhlcData, UTCTimestamp } from 'lightweight-charts';
import { PRESET_INDICATOR_SMA } from '@/logic/indicators/preset-indicator';
import { GenericData } from '@/app/(logic)/types';

const INCREMENTING_CANDLE_DATA = new Array(10).fill(0).map(
  (val, i) =>
    ({
      time: i,
      close: i + val,
      open: i + val,
      high: i + val + 1,
      low: i + val - 1,
    }) as OhlcData<UTCTimestamp>
);

describe('getConsolidatedSeries', () => {
  let result: { consolidatedSeries: OhlcData<UTCTimestamp>[]; indicatorStreams: IndicatorStreamData[] };

  describe('with sma of length 2', () => {
    beforeAll(() => {
      result = getConsolidatedSeries(
        INCREMENTING_CANDLE_DATA,
        [],
        [
          {
            ...PRESET_INDICATOR_SMA,
            params: [
              {
                // Param 0 is length
                ...PRESET_INDICATOR_SMA.params[0],
                value: 2,
              },
            ],
          },
        ]
      );
    });

    test('no value present before indicator has enough data to calculate', () => {
      const firstCandleTime = INCREMENTING_CANDLE_DATA[0].time;
      expect(result.indicatorStreams[0].data.find(d => d.time === firstCandleTime)).toBeUndefined();
    });

    test('once indicator has enough data, should return value', () => {
      expect(result.indicatorStreams[0].data[0].time).toBe(1);
      expect(result.indicatorStreams[0].data[0].value).toBe(0.5);
    });
  });

  describe('with sma of length 3', () => {
    beforeAll(() => {
      result = getConsolidatedSeries(
        INCREMENTING_CANDLE_DATA,
        [],
        [
          {
            ...PRESET_INDICATOR_SMA,
            params: [
              {
                // Param 0 is length
                ...PRESET_INDICATOR_SMA.params[0],
                value: 3,
              },
            ],
          },
        ]
      );
    });

    test('no value present before indicator has enough data to calculate', () => {
      expect(result.indicatorStreams[0].data.find(d => d.time === INCREMENTING_CANDLE_DATA[1].time)).toBeUndefined();
    });

    test('once indicator has enough data, should return value', () => {
      expect(result.indicatorStreams[0].data[0].time).toBe(2); // 0, 1, [2]
      expect(result.indicatorStreams[0].data[0].value).toBe(1); // (0 + 1 + 2) / 3
    });
  });
});
