import { Indicator, IndicatorParamType, IndicatorParamWidget, IndicatorType } from '@/logic/indicators/types';
import { v4 as uuid } from 'uuid';

export function generateSmaPreset(input: { tag: string; series: string; length: number; color: string }): Indicator {
  const { tag, series, length, color } = input;
  return {
    id: uuid(),
    tag,

    label: 'Simple Moving Average',
    params: [
      {
        name: 'length',
        type: IndicatorParamType.NUMBER,
        label: 'Length',
        required: true,
        defaultValue: length,
        value: length,
      },
      {
        name: 'field',
        type: IndicatorParamType.FIELD,
        label: 'Field',
        required: true,
        defaultValue: 'close',
        value: series,
      },
    ],
    funcStr: `function indicator() {
      const value = sma($$field.slice(0, $$length), $$length);
      return { value };
    }`,
    overlay: true,
    streams: [
      {
        tag: 'value',
        overlay: true,
        lineWidth: 1,
        color,
      },
    ],
    properties: ['value'],
  };
}

export const PRESET_INDICATOR_SMA = generateSmaPreset('close', 20);

export const PRESET_INDICATOR_SMA_CHANNEL: Indicator = {
  id: uuid(),
  tag: 'sma_channel',
  label: 'Simple Moving Average Channel',
  params: [
    {
      name: 'length',
      type: IndicatorParamType.NUMBER,
      label: 'Length',
      required: true,
      defaultValue: 20,
      value: 20,
    },
  ],
  funcStr: `function indicator() {
    const low_channel = sma(low.slice(0, $$length), $$length);
    const high_channel = sma(high.slice(0, $$length), $$length);
    return { low_channel, high_channel };
  }`,
  overlay: true,
  streams: [
    {
      tag: 'low_channel',
      overlay: true,
      lineWidth: 1,
      color: '#FF0000',
    },
    {
      tag: 'high_channel',
      overlay: true,
      lineWidth: 1,
      color: '#00FF00',
    },
  ],
  properties: ['low_channel', 'high_channel'],
};

export const PRESET_INDICATOR_EMA: Indicator = {
  id: uuid(),
  tag: 'ema',
  label: 'Exponential Moving Average',
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
  funcStr: `function indicator() {
    const value = ema($$field.slice(0, $$length), $$length);
    return { value };
  }`,
  overlay: true,
  streams: [
    {
      tag: 'value',
      overlay: true,
      lineWidth: 1,
      color: 'yellow',
    },
  ],
  properties: ['value'],
};

export const PRESET_INDICATOR_BOLLINGER_BANDS: Indicator = {
  id: uuid(),
  tag: 'bollinger_bands',
  label: 'Bollinger Bands',
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
      name: 'stdDevMultiplier',
      type: IndicatorParamType.NUMBER,
      label: 'Std Dev Multiplier',
      required: true,
      defaultValue: 2,
      value: 2,
    },
  ],
  funcStr: `function indicator() {
    const middle_band = sma(close, $$length);
    const std_dev = stddev(close, $$length);
    const upper_band = middle_band + std_dev * $$stdDevMultiplier;
    const lower_band = middle_band - std_dev * $$stdDevMultiplier;
    return { middle_band, upper_band, lower_band };
  }`,
  overlay: true,
  streams: [
    {
      tag: 'middle_band',
      overlay: true,
      lineWidth: 1,
      color: '#CC0000', // Middle band in blue
    },
    {
      tag: 'upper_band',
      overlay: true,
      lineWidth: 1,
      color: '#10CAF9', // Upper band in red
    },
    {
      tag: 'lower_band',
      overlay: true,
      lineWidth: 1,
      color: '#10CAF9', // Lower band in green
    },
  ],
  properties: ['middle_band', 'upper_band', 'lower_band'],
};

export const MUCKABOUT: Indicator = {
  id: uuid(),
  tag: 'muckabout',
  label: 'Muckabout',
  params: [],
  funcStr: `function indicator() {
    return { line: 40000 };
  }`,
  overlay: true,
  streams: [
    {
      tag: 'line',
      overlay: true,
      lineWidth: 1,
      color: '#10CAF9', // Upper band in red
    },
  ],
  properties: ['line'],
};

export const PRESET_INDICATORS: Indicator[] = [
  PRESET_INDICATOR_SMA,
  PRESET_INDICATOR_EMA,
  PRESET_INDICATOR_SMA_CHANNEL,
  PRESET_INDICATOR_BOLLINGER_BANDS,
  // ... add more presets here

  MUCKABOUT,
];
