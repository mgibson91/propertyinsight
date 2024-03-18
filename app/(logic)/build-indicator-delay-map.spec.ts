import { Indicator, IndicatorParamType, IndicatorType } from '@/logic/indicators/types';
import { buildIndicatorDelayMap } from './build-indicator-delay-map'; // Adjust the import path based on your project structure

describe('buildIndicatorDelayMap', () => {
  test('1 - correctly calculates required lengths', () => {
    const indicators: Indicator[] = [
      {
        tag: 'sma',
        label: 'Simple Moving Average',
        funcStr: `const value = sma($field.slice(0, $length), $length); return { value };`,
        params: [{ name: 'length', type: IndicatorParamType.NUMBER, label: 'Length', required: true, value: 20 }],
        overlay: true,
        streams: [
          {
            tag: 'value',
            overlay: true,
            color: 'blue',
            lineWidth: 2,
          },
        ],
      },
    ];

    const dependencyMap = buildIndicatorDelayMap(indicators);

    expect(dependencyMap.get('sma_value')).toBe(20);
  });

  test('2 - Another indicator, the original indicator length is taken into account', () => {
    const indicators: Indicator[] = [
      {
        tag: 'sma',

        label: 'Simple Moving Average',
        funcStr: `const value = sma($field.slice(0, $length), $length); return { value };`,
        params: [
          { name: 'length', type: IndicatorParamType.NUMBER, label: 'Length', required: true, value: 20 },
          { name: 'field', type: IndicatorParamType.FIELD, label: 'Field', required: true, value: 'close' },
        ],
        overlay: true,
        streams: [
          {
            tag: 'value',
            overlay: true,
            color: 'blue',
            lineWidth: 2,
          },
        ],
      },
      {
        tag: 'sma2',

        label: 'Simple Moving Average',
        funcStr: `const value = sma($field.slice(0, $length), $length); return { value };`,
        params: [
          { name: 'length', type: IndicatorParamType.NUMBER, label: 'Length', required: true, value: 20 },
          { name: 'field', type: IndicatorParamType.FIELD, label: 'Field', required: true, value: 'sma_value' },
        ],
        overlay: true,
        streams: [
          {
            tag: 'value',
            overlay: true,
            color: 'blue',
            lineWidth: 2,
          },
        ],
      },
    ];

    const dependencyMap = buildIndicatorDelayMap(indicators);

    expect(dependencyMap.get('sma2_value')).toBe(40);
  });

  test('2b - Another indicator, referencing the original in code', () => {
    const indicators: Indicator[] = [
      {
        tag: 'sma',

        label: 'Simple Moving Average',
        funcStr: `const value = sma($field.slice(0, $length), $length); return { value };`,
        params: [
          { name: 'length', type: IndicatorParamType.NUMBER, label: 'Length', required: true, value: 20 },
          { name: 'field', type: IndicatorParamType.FIELD, label: 'Field', required: true, value: 'close' },
        ],
        overlay: true,
        streams: [
          {
            tag: 'value',
            overlay: true,
            color: 'blue',
            lineWidth: 2,
          },
        ],
      },
      {
        tag: 'sma2',

        label: 'Simple Moving Average',
        funcStr: 'return { value: sma_value + 1000 };',
        params: [{ name: 'length', type: IndicatorParamType.NUMBER, label: 'Length', required: true, value: 20 }],
        overlay: true,
        streams: [
          {
            tag: 'value',
            overlay: true,
            color: 'blue',
            lineWidth: 2,
          },
        ],
      },
    ];

    const dependencyMap = buildIndicatorDelayMap(indicators);

    expect(dependencyMap.get('sma2_value')).toBe(40);
  });

  test('3 - Triple nested', () => {
    const indicators: Indicator[] = [
      {
        tag: 'sma',

        label: 'Simple Moving Average',
        funcStr: `const value = sma($field.slice(0, $length), $length); return { value };`,
        params: [
          { name: 'length', type: IndicatorParamType.NUMBER, label: 'Length', required: true, value: 20 },
          { name: 'field', type: IndicatorParamType.FIELD, label: 'Field', required: true, value: 'close' },
        ],
        overlay: true,
        streams: [
          {
            tag: 'value',
            overlay: true,
            color: 'blue',
            lineWidth: 2,
          },
        ],
      },
      {
        tag: 'sma2',

        label: 'Simple Moving Average',
        funcStr: `const value = sma($field.slice(0, $length), $length); return { value };`,
        params: [
          { name: 'length', type: IndicatorParamType.NUMBER, label: 'Length', required: true, value: 20 },
          { name: 'field', type: IndicatorParamType.FIELD, label: 'Field', required: true, value: 'sma_value' },
        ],
        overlay: true,
        streams: [
          {
            tag: 'value',
            overlay: true,
            color: 'blue',
            lineWidth: 2,
          },
        ],
      },
      {
        tag: 'sma3',

        label: 'Simple Moving Average',
        funcStr: `const value = sma($field.slice(0, $length), $length); return { value };`,
        params: [
          { name: 'length', type: IndicatorParamType.NUMBER, label: 'Length', required: true, value: 20 },
          { name: 'field', type: IndicatorParamType.FIELD, label: 'Field', required: true, value: 'sma2_value' },
        ],
        overlay: true,
        streams: [
          {
            tag: 'value',
            overlay: true,
            color: 'blue',
            lineWidth: 2,
          },
        ],
      },
    ];

    const dependencyMap = buildIndicatorDelayMap(indicators);

    expect(dependencyMap.get('sma3_value')).toBe(60);
  });

  test('Correctly takes the max of multiple', () => {
    const indicators: Indicator[] = [
      {
        tag: 'sma1',

        label: 'Simple Moving Average',
        funcStr: `const value = sma($field.slice(0, $length), $length); return { value };`,
        params: [
          { name: 'length', type: IndicatorParamType.NUMBER, label: 'Length', required: true, value: 20 },
          { name: 'field', type: IndicatorParamType.FIELD, label: 'Field', required: true, value: 'close' },
        ],
        overlay: true,
        streams: [
          {
            tag: 'value',
            overlay: true,
            color: 'blue',
            lineWidth: 2,
          },
        ],
      },
      {
        tag: 'sma2',

        label: 'Simple Moving Average',
        funcStr: `const value = sma($field.slice(0, $length), $length); return { value };`,
        params: [
          { name: 'length', type: IndicatorParamType.NUMBER, label: 'Length', required: true, value: 21 },
          { name: 'field', type: IndicatorParamType.FIELD, label: 'Field', required: true, value: 'close' },
        ],
        overlay: true,
        streams: [
          {
            tag: 'value',
            overlay: true,
            color: 'blue',
            lineWidth: 2,
          },
        ],
      },
      {
        tag: 'sma3',

        label: 'Simple Moving Average',
        funcStr: `const value = sma($field.slice(0, $length), $length); return { value };`,
        params: [
          { name: 'field', type: IndicatorParamType.FIELD, label: 'Field', required: true, value: 'sma1_value' },
          { name: 'field', type: IndicatorParamType.FIELD, label: 'Field', required: true, value: 'sma2_value' },
        ],
        overlay: true,
        streams: [
          {
            tag: 'value',
            overlay: true,
            color: 'blue',
            lineWidth: 2,
          },
        ],
      },
    ];

    const dependencyMap = buildIndicatorDelayMap(indicators);

    expect(dependencyMap.get('sma3_value')).toBe(21);
  });
});
