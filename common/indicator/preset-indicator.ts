import { Indicator, IndicatorParamType, IndicatorParamWidget, IndicatorType } from '@/common/indicator/types';

const PRESET_INDICATOR_SMA: Indicator = {
  id: 'simple-moving-average',
  type: IndicatorType.SIMPLE_MOVING_AVERAGE,
  label: 'Simple Moving Average',
  params: [
    {
      name: 'windowSize',
      type: IndicatorParamType.NUMBER,
      label: 'Window Size',
      defaultValue: 20,
    },
    { name: 'field', type: IndicatorParamType.FIELD, label: 'Field' },
  ],
  funcStr: `const windowSize = %windowSize%;  // Setting the period for SMA
  
  const smaData = data.map((current, index) => {
    if (index >= windowSize - 1) {
      // Calculate SMA only when there are enough preceding data points
      let sum = 0;
      // Sum the closing prices of the last 'windowSize' days
      for (let i = index - windowSize + 1; i <= index; i++) {
        sum += data[i]['%field%'];
      }
      let average = sum / windowSize;
      return { time: current.time, value: average };
    } else {
      return null;  // Not enough data to calculate SMA
    }
  });`,
};

const PRESET_INDICATOR_BOLLINGER_BANDS: Indicator = {
  id: 'bollinger-bands',
  type: IndicatorType.BOLLINGER_BANDS,
  label: 'Bolling Bands',
  params: [
    {
      name: 'windowSize',
      type: IndicatorParamType.NUMBER,
      label: 'Window Size',
      defaultValue: 20,
    },
    { name: 'field', type: IndicatorParamType.FIELD, label: 'Field' },
  ],
  funcStr: `const windowSize = %windowSize%;  // Setting the period for SMA
  
  const smaData = data.map((current, index) => {
    if (index >= windowSize - 1) {
      // Calculate SMA only when there are enough preceding data points
      let sum = 0;
      // Sum the closing prices of the last 'windowSize' days
      for (let i = index - windowSize + 1; i <= index; i++) {
        sum += data[i]['%field%'];
      }
      let average = sum / windowSize;
      return { time: current.time, value: average };
    } else {
      return null;  // Not enough data to calculate SMA
    }
  });`,
};

const PRESET_INDICATORS: Indicator[] = [
  PRESET_INDICATOR_SMA,
  // ... add more presets here
];
