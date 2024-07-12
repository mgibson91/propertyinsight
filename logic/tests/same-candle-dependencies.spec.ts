import { Indicator, IndicatorParamType, IndicatorTag } from '@/logic/indicators/types';
import { OhlcData, UTCTimestamp } from 'lightweight-charts';
import { GenericData } from '@/app/(logic)/types';
import { getConsolidatedSeriesNew } from '../get-consolidated-series-new';
import { TriggerId } from '@/components/triggers/edit-trigger';
import { calculateTriggerEvents } from '@/logic/triggers/calculate-trigger-events';

const INCREMENTING_CANDLE_DATA = new Array(2).fill(10).map(
  (val, i) =>
    ({
      time: i,
      close: i + val,
      open: i + val,
      high: i + val + 1,
      low: i + val - 1,
    }) as OhlcData<UTCTimestamp>
);

const COMMON_FIELDS = {
  id: '1',
  params: [
    // {
    //   name: 'length',
    //   type: IndicatorParamType.NUMBER,
    //   label: 'Length',
    //   required: true,
    //   defaultValue: 20,
    //   value: 20,
    // },
  ],
  properties: ['value'],
};

const TEST_INDICATORS: Omit<Indicator, 'streams' | 'overlay' | 'label'>[] = [
  {
    ...COMMON_FIELDS,
    tag: 'first' as IndicatorTag,
    funcStr: `function indicator() {
  return {
    value: close[0] + 1,
  };
}`,
  },
  {
    ...COMMON_FIELDS,
    tag: 'second' as IndicatorTag,
    funcStr: `function indicator() {
  return {
    value: $first_value[0] + 1,
  };
}`,
  },
  {
    ...COMMON_FIELDS,
    tag: 'fourth' as IndicatorTag,
    funcStr: `function indicator() {
  return {
    value: $third_value[0] + 1,
  };
}`,
  },
  {
    ...COMMON_FIELDS,
    tag: 'third' as IndicatorTag,
    funcStr: `function indicator() {
  return {
    value: $second_value[0] + 1,
  };
}`,
  },
];

describe('full process', () => {
  test('should resolve', () => {
    const { data, streams, delayMap } = getConsolidatedSeriesNew({
      data: INCREMENTING_CANDLE_DATA as unknown as GenericData[],
      defaultFields: [],
      indicators: TEST_INDICATORS,
    });

    expect(data).toEqual([
      {
        time: 0,
        open: 10,
        close: 10,
        high: 11,
        low: 9,
        first_value: 11,
        second_value: 12,
        third_value: 13,
        fourth_value: 14,
      },
      {
        time: 1,
        open: 11,
        close: 11,
        high: 12,
        low: 10,
        first_value: 12,
        second_value: 13,
        third_value: 14,
        fourth_value: 15,
      },
    ]);
  });
});
