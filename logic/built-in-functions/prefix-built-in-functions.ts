import { sma } from '@/logic/built-in-functions/sma';
import { ema } from '@/logic/built-in-functions/ema';

export function prefixBuiltInFunctions(text: string) {
  return `
  ${sma.toString()}
  ${ema.toString()}
  ${text}
  `;
}
