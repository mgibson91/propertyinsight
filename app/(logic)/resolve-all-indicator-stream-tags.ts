import { Indicator } from '@/logic/indicators/types';

export function resolveAllIndicatorStreamTags(
  indicators: Omit<Indicator, 'streams' | 'overlay' | 'label'>[]
): { indicatorTag: string; streamTag: string }[] {
  return indicators.flatMap(indicator => {
    return indicator.properties.map(property => {
      return {
        indicatorTag: indicator.tag,
        streamTag: `${indicator.tag}_${property}`,
      };
    });
  });
}
