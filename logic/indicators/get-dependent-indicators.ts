import { findUsedVariablesInCode } from '@/app/(logic)/find-used-variables-in-code';
import { Indicator, IndicatorTag } from '@/logic/indicators/types';

export function getDependentIndicators({
  streamTagIndicatorMap,
  funcStr,
}: {
  streamTagIndicatorMap: Record<string, Indicator>;
  funcStr: string;
}) {
  const variablesNames = Object.keys(streamTagIndicatorMap).map(tag => `$${tag}`);
  const usedVariables = findUsedVariablesInCode(funcStr, variablesNames);

  const dependentIndicators = new Set<IndicatorTag>();
  usedVariables.forEach(variable => {
    const matchedIndicator = streamTagIndicatorMap[variable.slice(1)];
    if (matchedIndicator) {
      dependentIndicators.add(matchedIndicator.tag);
    }
  });

  return Array.from(dependentIndicators);
}
