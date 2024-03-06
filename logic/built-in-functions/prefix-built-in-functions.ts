import { sma } from '@/logic/built-in-functions/sma';
import { ema } from '@/logic/built-in-functions/ema';
import { stddev } from '@/logic/built-in-functions/stddev';

export function prefixBuiltInFunctions(text: string) {
  return `
  ${sma.toString()}
  ${ema.toString()}
  ${stddev.toString()}
  ${text}
  `;
}
