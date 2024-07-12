import { ResolvedIndicator } from '@/logic/indicators/resolve-indicator';
import { IndicatorTag } from '@/logic/indicators/types';

export function buildDelayMapNew(resolvedIndicators: ResolvedIndicator[]): Record<IndicatorTag, number> {
  const delayMap: Record<IndicatorTag, number> = {};

  // Iterate through resolved indicators
  resolvedIndicators.forEach(indicator => {
    // If the indicator has no dependencies, add its length directly to the delay map
    if (indicator.dependsOnIndicatorTags.length === 0) {
      delayMap[indicator.tag] = indicator.length;
    } else {
      // If the indicator has dependencies, find the maximum delay of its dependencies
      const maxDependencyDelay = Math.max(...indicator.dependsOnIndicatorTags.map(depTag => delayMap[depTag]));
      // The delay for this indicator is its length plus the maximum delay of its dependencies
      delayMap[indicator.tag] = indicator.length + maxDependencyDelay;
    }
  });

  return delayMap;
}
