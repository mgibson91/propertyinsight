import { SMA_FUNCTION } from '@/logic/built-in-functions/aggregations/sma';
import { EMA_FUNCTION } from '@/logic/built-in-functions/aggregations/ema';
import { STDDEV_FUNCTION } from '@/logic/built-in-functions/aggregations/stddev';

export function prefixBuiltInFunctions(funcStr: string) {
  return `
  ${SMA_FUNCTION}
  ${EMA_FUNCTION}
  ${STDDEV_FUNCTION}
  ${funcStr}
  `;
}
