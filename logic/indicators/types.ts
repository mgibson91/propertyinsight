import * as z from 'zod';
import { Brand } from '@/utils/brand';

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
  type: 'number' | 'field';
  label: string;
  required: boolean;
  value?: unknown;
  defaultValue?: unknown; // TODO -> Just "default" and leave value to provided elsewhere as user input - should be IndicatorParamConfig instead
}

export const IndicatorSchema = z.object({
  id: z.string(),
  tag: z.string(),
  label: z.string(),
  funcStr: z.string(),
  params: z.array(
    z.object({
      name: z.string(),
      // export enum IndicatorParamType {
      //   NUMBER = 'number',
      //   FIELD = 'field',
      // }
      type: z.enum(['number', 'field']),
      label: z.string(),
      required: z.boolean(),
      value: z.any(),
      defaultValue: z.any(),
    })
  ),
  overlay: z.boolean(),
  properties: z.array(z.string()),
  streams: z.array(
    z.object({
      tag: z.string(),
      overlay: z.boolean(),
      color: z.string(),
      lineWidth: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    })
  ),
});

export type IndicatorTag = Brand<string, 'IndicatorTag'>;
export type Indicator = z.infer<typeof IndicatorSchema> & { tag: IndicatorTag };

// // Represent everything either configured by or displayed to the user
// export interface Indicator {
//   id: string;
//   tag: string; // reference
//   label: string;
//   funcStr: string;
//   params: IndicatorParam[];
//   overlay: boolean;
//   properties: string[]; // Derived outputs from an indicator
//   streams: {
//     tag: string;
//     overlay: boolean;
//     color: string;
//     lineWidth: 1 | 2 | 3 | 4;
//   }[];
// }

export interface IndicatorParamValue {
  key: string;
  value: unknown;
}
