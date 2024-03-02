import { Indicator, IndicatorParamType, IndicatorParamWidget, IndicatorType } from '@/logic/indicators/types';

export const PRESET_INDICATOR_SMA: Indicator = {
  id: 'simple-moving-average',
  type: IndicatorType.SIMPLE_MOVING_AVERAGE,
  label: 'Simple Moving Average',
  params: [
    {
      name: 'length',
      type: IndicatorParamType.NUMBER,
      label: 'Length',
      defaultValue: 20,
    },
    // { name: 'field', type: IndicatorParamType.FIELD, label: 'Field' },
  ],
  funcStr: `
  return sma(close.slice(length), length)
`,
};

export const PRESET_INDICATOR_EMA: Indicator = {
  id: 'exponential-moving-average',
  type: IndicatorType.EXPONENTIAL_MOVING_AVERAGE,
  label: 'Exponential Moving Average',
  params: [
    {
      name: 'length',
      type: IndicatorParamType.NUMBER,
      label: 'Length',
      defaultValue: 20,
    },
    // { name: 'field', type: IndicatorParamType.FIELD, label: 'Field' },
  ],
  funcStr: `
  return ema(close.slice(length), length)
`,
};

const PRESET_INDICATOR_BOLLINGER_BANDS: Indicator = {
  id: 'bollinger-bands',
  type: IndicatorType.BOLLINGER_BANDS,
  label: 'Bolling Bands',
  params: [
    {
      name: 'length',
      type: IndicatorParamType.NUMBER,
      label: 'Window Size',
      defaultValue: 20,
    },
    { name: 'field', type: IndicatorParamType.FIELD, label: 'Field' },
  ],
  funcStr: `const length = %length%;  // Setting the period for SMA
  
  const smaData = data.map((current, index) => {
    if (index >= length - 1) {
      // Calculate SMA only when there are enough preceding data points
      let sum = 0;
      // Sum the closing prices of the last 'length' days
      for (let i = index - length + 1; i <= index; i++) {
        sum += data[i]['%field%'];
      }
      let average = sum / length;
      return { time: current.time, value: average };
    } else {
      return null;  // Not enough data to calculate SMA
    }
  });`,
};

export const PRESET_INDICATORS: Indicator[] = [
  PRESET_INDICATOR_SMA,
  PRESET_INDICATOR_EMA,
  // ... add more presets here
];
