import { Indicator, IndicatorParamType } from '@/logic/indicators/types';
import { OhlcData, UTCTimestamp } from 'lightweight-charts';
import { GenericData } from '@/app/(logic)/types';
import { getConsolidatedSeriesNew } from './get-consolidated-series-new';

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

const TEST_INDICATORS: Omit<Indicator, 'streams' | 'overlay' | 'label'>[] = [
  {
    id: '1',
    tag: 'sma',
    funcStr: `function indicator() {
  const value = sma($$field.slice(0, $$length), $$length);
  return {
    value,
  };
}`,
    params: [
      {
        name: 'length',
        type: IndicatorParamType.NUMBER,
        label: 'Length',
        required: true,
        defaultValue: 20,
        value: 20,
      },
      {
        name: 'field',
        type: IndicatorParamType.FIELD,
        label: 'Field',
        required: true,
        defaultValue: 'close',
        value: 'close',
      },
    ],
    properties: ['value'],
  },
  {
    id: '2',
    tag: 'channel',
    funcStr: `function indicator() {
  const value = sma($$field.slice(0, $$length), $$length);
  return {
    high_channel: value + 1,
    low_channel: value - 1,
  };
}`,
    params: [
      {
        name: 'length',
        type: IndicatorParamType.NUMBER,
        label: 'Length',
        required: true,
        defaultValue: 20,
        value: 20,
      },
      {
        name: 'field',
        type: IndicatorParamType.FIELD,
        label: 'Field',
        required: true,
        defaultValue: 'close',
        value: 'close',
      },
    ],
    properties: ['high', 'low'],
  },
  // TODO: Example with substituted field
];

describe('full process', () => {
  test('should resolve', () => {
    const result = getConsolidatedSeriesNew({
      data: INCREMENTING_CANDLE_DATA as unknown as GenericData[],
      defaultFields: [],
      indicatorInputMap: {
        sma: {
          length: 2,
          field: 'open',
        },
        channel: {
          length: 5,
          field: '$sma_value',
        },
      },
      indicators: TEST_INDICATORS,
    });

    console.log(result);
  });
});
