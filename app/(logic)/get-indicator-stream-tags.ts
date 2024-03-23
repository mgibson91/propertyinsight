import { Indicator } from '@/logic/indicators/types';

export function getIndicatorStreamTags(indicator: Indicator, existingIndicators: Indicator[]): string[] {
  const index = existingIndicators.findIndex(i => i.tag === indicator.tag);
  if (index === -1) {
    return [];
  }

  return existingIndicators.slice(0, index).flatMap(i => i.streams.map(s => `${i.tag}_${s.tag}`));
}

export const DEFAULT_FIELDS = ['open', 'high', 'low', 'close']; // TODO: Make configurable for multi domain
