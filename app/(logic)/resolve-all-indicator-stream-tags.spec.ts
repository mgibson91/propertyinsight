import { Indicator, IndicatorParamType } from '@/logic/indicators/types';
import { resolveAllIndicatorStreamTags } from '@/app/(logic)/resolve-all-indicator-stream-tags';

const TEST_INDICATORS: Omit<Indicator, 'streams' | 'overlay' | 'label'>[] = [
  {
    tag: 'sma',
    funcStr: `function indicator() {
  const value = sma($field.slice(0, $length), $length);
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
    tag: 'sma_channel',
    funcStr: `function indicator() {
  const value = sma($field.slice(0, $length), $length);
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
    properties: ['high_channel', 'low_channel'],
  },
  // TODO: Example with substituted field
];

describe('resolveAllIndicatorStreamTags', () => {
  test('should resolve all indicator stream tags', () => {
    const resolved = resolveAllIndicatorStreamTags(TEST_INDICATORS);

    expect(resolved).toEqual([
      { indicatorTag: 'sma', streamTag: 'sma_value' },
      { indicatorTag: 'sma_channel', streamTag: 'sma_channel_high_channel' },
      { indicatorTag: 'sma_channel', streamTag: 'sma_channel_low_channel' },
    ]);
  });
});
