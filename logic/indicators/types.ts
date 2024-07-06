export enum IndicatorType {
  SIMPLE_MOVING_AVERAGE = 'simple-moving-average',
  SIMPLE_MOVING_AVERAGE_CHANNEL = 'simple-moving-average-channel',
  EXPONENTIAL_MOVING_AVERAGE = 'ema',
  BOLLINGER_BANDS = 'bollinger-bands',
}
export enum IndicatorParamType {
  NUMBER = 'number',
  FIELD = 'field',
}

export enum IndicatorParamWidget {
  INPUT = 'input',
  SELECT = 'select',
}

export interface IndicatorParam {
  name: string;
  type: IndicatorParamType;
  label: string;
  required: boolean;
  value?: unknown;
  defaultValue?: unknown; // TODO -> Just "default" and leave value to provided elsewhere as user input - should be IndicatorParamConfig instead
}

// Represent everything either configured by or displayed to the user
export interface Indicator {
  id: string;
  tag: string; // reference
  label: string;
  funcStr: string;
  params: IndicatorParam[];
  overlay: boolean;
  properties: string[]; // Derived outputs from an indicator
  streams: {
    tag: string;
    overlay: boolean;
    color: string;
    lineWidth: 1 | 2 | 3 | 4;
  }[];
}

export interface IndicatorParamValue {
  key: string;
  value: unknown;
}
