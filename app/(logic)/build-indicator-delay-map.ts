import { Indicator } from '@/logic/indicators/types';
import { findUsedVariablesInCode } from '@/app/(logic)/find-used-variables-in-code';

export function buildIndicatorDelayMap(indicators: Indicator[]): Map<string, number> {
  const existingIndicatorStreams = new Set<string>();
  const dependencyMap = new Map<string, number>();

  // Helper function to recursively calculate length, including dependencies
  function calculateLength(indicator: Indicator): number {
    const lengthParam = indicator.params.find(param => param.name === 'length');
    let length = lengthParam ? Number(lengthParam.value) : 0;

    // If the indicator has already been processed, return the length
    const streamDependenciesFromInput = indicator.params
      .filter(param => param.type === 'field' && !['open', 'high', 'low', 'close'].includes(param.value as string))
      .map(param => param.value) as string[];
    const streamDependenciesFromCode = findUsedVariablesInCode(`() => {${indicator.funcStr}}`, [
      ...existingIndicatorStreams,
    ]);

    const streamDependencies = new Set<string>([...streamDependenciesFromInput, ...streamDependenciesFromCode]);

    const maxStreamLength = [...streamDependencies].reduce((max: number, indicatorStream: string) => {
      return Math.max(max, dependencyMap.get(indicatorStream) || 0);
    }, 0);

    length += maxStreamLength;

    indicator.streams.forEach(stream => {
      const key = `${indicator.tag}_${stream.tag}`;
      dependencyMap.set(key, length);
    });

    return length;
  }

  // Iterate through each indicator and calculate length, including for dependencies
  indicators.forEach(indicator => {
    indicator.streams.forEach(stream => {
      calculateLength(indicator);
      existingIndicatorStreams.add(`${indicator.tag}_${stream.tag}`);
    });
  });

  return dependencyMap;
}
