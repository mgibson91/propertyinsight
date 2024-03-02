export enum IndicatorType {
  SIMPLE_MOVING_AVERAGE = 'simple-moving-average',
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
  defaultValue?: unknown;
}

export interface Indicator {
  id: string;
  type: IndicatorType; // For type safety of metadata down the line
  label: string;
  funcStr: string;
  params: IndicatorParam[];
}

export interface IndicatorParamValue {
  key: string;
  value: unknown;
}
