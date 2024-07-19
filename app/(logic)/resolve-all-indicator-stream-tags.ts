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

export function buildStreamTagIndicatorMap(indicators: Indicator[]): Record<string, Indicator> {
  const streamTagIndicatorMap: Record<string, Indicator> = {};

  indicators.forEach(indicator => {
    indicator.properties.forEach(property => {
      const streamTag = `${indicator.tag}_${property}`;
      streamTagIndicatorMap[streamTag] = indicator;
    });
  });

  return streamTagIndicatorMap;
}
