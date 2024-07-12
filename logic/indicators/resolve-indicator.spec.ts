import { Indicator, IndicatorParamType } from '@/logic/indicators/types';
import { ResolvedIndicator, resolveIndicator } from '@/logic/indicators/resolve-indicator';

const TEST_INDICATOR: Indicator = {
  tag: 'sma',
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

describe('resolve indicators', () => {
  describe('with no dependencies', () => {
    describe('with specified values', () => {
      test('should resolve', () => {
        const resolved = resolveIndicator({
          indicator: TEST_INDICATOR,
          inputs: {
            length: 2,
            field: 'open',
          },
          allStreamTags: [],
        });

        expect(resolved).toEqual({
          tag: 'sma',
          funcStr: `function indicator() {
  const value = sma(open.slice(0, 2), 2);
  return {
    value,
  };
}`,
          dependsOnIndicatorTags: [],
          outputStreamTags: ['value'],
          length: 2,
        } satisfies ResolvedIndicator);
      });
    });

    describe('with defaults', () => {
      test('should resolve', () => {
        const resolved = resolveIndicator({
          indicator: TEST_INDICATOR,
          inputs: {},
          allStreamTags: [],
        });

        expect(resolved).toEqual({
          tag: 'sma',
          funcStr: `function indicator() {
  const value = sma(close.slice(0, 20), 20);
  return {
    value,
  };
}`,
          dependsOnIndicatorTags: [],
          outputStreamTags: ['value'],
          length: 20,
        } satisfies ResolvedIndicator);
      });
    });
  });

  describe('with dependencies', () => {
    test('should resolve', () => {
      const resolved = resolveIndicator({
        indicator: {
          ...TEST_INDICATOR,
          tag: 'derived_sma',
          properties: ['value', 'value1'],
          funcStr: `function indicator() {
  const value = sma($prev_1.slice(0, $$length), $$length);
  const value2 = sma($prev_2.slice(0, $$length), $$length);
  return {
    value,
    value1
  };
}`,
        },
        inputs: {},
        allStreamTags: [
          { indicatorTag: 'prev', streamTag: 'prev_1' },
          { indicatorTag: 'prev', streamTag: 'prev_2' },
        ],
      });

      expect(resolved).toEqual({
        tag: 'derived_sma',
        funcStr: `function indicator() {
  const value = sma($prev_1.slice(0, 20), 20);
  const value2 = sma($prev_2.slice(0, 20), 20);
  return {
    value,
    value1
  };
}`,
        dependsOnIndicatorTags: ['prev'],
        outputStreamTags: ['value', 'value1'],
        length: 20,
      } satisfies ResolvedIndicator);
    });
  });
});
