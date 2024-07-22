import { getDependentIndicators } from '@/logic/indicators/get-dependent-indicators';
import { Indicator, IndicatorParamType, IndicatorTag } from '@/logic/indicators/types';
import { buildStreamTagIndicatorMap } from '@/app/(logic)/resolve-all-indicator-stream-tags';

const TEST_INDICATOR: Indicator = {
  tag: 'sma' as IndicatorTag,
  label: 'Simple Moving Average',
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
  overlay: true,
  properties: ['value'],
  streams: [
    {
      tag: 'value',
      overlay: true,
      lineWidth: 1,
      color: '#FFFFFF',
    },
  ],
};

describe('getDependentIndicators', () => {
  test('should return dependent indicators', () => {
    const streamTagIndicatorMap = buildStreamTagIndicatorMap([TEST_INDICATOR]);

    const funcStr = `const value = $sma_value[0] + 10;`;

    const dependentIndicators = getDependentIndicators({ streamTagIndicatorMap, funcStr });

    expect(dependentIndicators).toEqual(['sma']);
  });

  // test('should return multiple dependent indicators', () => {
  //   const streamTagIndicatorMap = {
  //     sma: { tag: 'sma' },
  //     channel: { tag: 'channel' },
  //   };
  //   const funcStr = `const value = sma(open.slice(0, 2), 2); const value1 = channel(open.slice(0, 2), 2);`;
  //
  //   const dependentIndicators = getDependentIndicators({ streamTagIndicatorMap, funcStr });
  //
  //   expect(dependentIndicators).toEqual(['sma', 'channel']);
  // });
  //
  // test('should return empty array if no dependent indicators', () => {
  //   const streamTagIndicatorMap = {
  //     sma: { tag: 'sma' },
  //     channel: { tag: 'channel' },
  //   };
  //   const funcStr = `const value = open.slice(0, 2);`;
  //
  //   const dependentIndicators = getDependentIndicators({ streamTagIndicatorMap, funcStr });
  //
  //   expect(dependentIndicators).toEqual([]);
  // });
});
