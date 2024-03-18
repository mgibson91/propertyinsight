import { crossover } from '@/logic/built-in-functions/triggers/crossover';
import { crossunder } from '@/logic/built-in-functions/triggers/crossunder';

export function prefixCommonTriggerFunctions(text: string) {
  return `
  ${crossover.toString()}
  ${crossunder.toString()}
  ${text}
  `;
}
