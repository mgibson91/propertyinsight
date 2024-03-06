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
  defaultValue?: unknown;
}

// Represent everything either configured by or displayed to the user
export interface Indicator {
  tag: string;
  type: IndicatorType; // For type safety of metadata down the line
  label: string;
  funcStr: string;
  params: IndicatorParam[];
  overlay: boolean;
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
