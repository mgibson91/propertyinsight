import { Indicator, IndicatorParamType, IndicatorType } from '@/logic/indicators/types';
import { buildIndicatorDelayMap } from './build-indicator-delay-map'; // Adjust the import path based on your project structure

describe('buildIndicatorDelayMap', () => {
  test('1 - correctly calculates required lengths', () => {
    const indicators: Indicator[] = [
      {
        tag: 'sma',
        type: IndicatorType.SIMPLE_MOVING_AVERAGE,
        label: 'Simple Moving Average',
        funcStr: 'calculateSMA',
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
        type: IndicatorType.SIMPLE_MOVING_AVERAGE,
        label: 'Simple Moving Average',
        funcStr: 'calculateSMA',
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
        type: IndicatorType.SIMPLE_MOVING_AVERAGE,
        label: 'Simple Moving Average',
        funcStr: 'calculateSMA',
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

  test('3 - Triple nested', () => {
    const indicators: Indicator[] = [
      {
        tag: 'sma',
        type: IndicatorType.SIMPLE_MOVING_AVERAGE,
        label: 'Simple Moving Average',
        funcStr: 'calculateSMA',
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
        type: IndicatorType.SIMPLE_MOVING_AVERAGE,
        label: 'Simple Moving Average',
        funcStr: 'calculateSMA',
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
        type: IndicatorType.SIMPLE_MOVING_AVERAGE,
        label: 'Simple Moving Average',
        funcStr: 'calculateSMA',
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
});
