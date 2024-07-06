import { sma } from '@/logic/built-in-functions/aggregations/sma';
import { ema } from '@/logic/built-in-functions/aggregations/ema';
import { stddev } from '@/logic/built-in-functions/aggregations/stddev';

export function prefixBuiltInFunctions(funcStr: string) {
  return `
  ${sma.toString()}
  ${ema.toString()}
  ${stddev.toString()}
  ${funcStr}
  `;
}
