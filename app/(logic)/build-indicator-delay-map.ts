import { Indicator } from '@/logic/indicators/types';

// export function buildIndicatorDelayMap(indicators: Indicator[]): Map<string, number> {
//   const dependencyMap = new Map<string, number>();
//
//   indicators.forEach(indicator => {
//     indicator.streams.forEach(stream => {
//       // Assuming each stream's required "length" is directly stated in the indicator's params
//       const lengthParam = indicator.params.find(param => param.name === 'length');
//       const length = lengthParam ? Number(lengthParam.value) : 0;
//       const key = `${indicator.tag}_${stream.tag}`;
//
//       // Add or update the entry in the map
//       dependencyMap.set(key, length);
//     });
//   });
//
//   return dependencyMap;
// }

export function buildIndicatorDelayMap(indicators: Indicator[]): Map<string, number> {
  const dependencyMap = new Map<string, number>();

  // Helper function to recursively calculate length, including dependencies
  function calculateLength(indicator: Indicator, streamTag: string): number {
    const lengthParam = indicator.params.find(param => param.name === 'length');
    let length = lengthParam ? Number(lengthParam.value) : 0;

    // Check if the indicator depends on another indicator's stream
    const fieldParam = indicator.params.find(param => param.name === 'field');
    if (fieldParam && typeof fieldParam.value === 'string' && fieldParam.value.includes('_')) {
      const dependencyKey = fieldParam.value;
      const dependencyLength = dependencyMap.get(dependencyKey) || 0;
      length += dependencyLength; // Add the dependency's length to this indicator's length
    }

    // Store the calculated length for this indicator's stream
    dependencyMap.set(`${indicator.tag}_${streamTag}`, length);

    return length;
  }

  // Iterate through each indicator and calculate length, including for dependencies
  indicators.forEach(indicator => {
    indicator.streams.forEach(stream => {
      calculateLength(indicator, stream.tag);
    });
  });

  return dependencyMap;
}
