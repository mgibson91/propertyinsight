import { Indicator, IndicatorTag } from '@/logic/indicators/types';
import { findUsedVariablesInCode } from '@/app/(logic)/find-used-variables-in-code';
import { parseFunctionReturnKeys } from '@/app/(logic)/parse-function-return-key';
import { IndicatorStreamMetadata } from '@/logic/get-consolidated-series-new';

export function determineExecutionOrder({
  indicators,
}: {
  indicators: Pick<Indicator, 'tag' | 'funcStr'>[];
}): IndicatorTag[] {
  const variableNames = indicators
    .map(indicator => parseFunctionReturnKeys(indicator.funcStr).map(key => `$${indicator.tag}_${key}`))
    .flat();
  const dependencies = new Map<IndicatorTag, IndicatorTag[]>();

  // Iterate through indicators, then streams and return flat array of { indicatorTag, streamTag }
  const streamTags: IndicatorStreamMetadata[] = [];

  for (const indicator of indicators) {
    const outputs = parseFunctionReturnKeys(indicator.funcStr);

    outputs.forEach(output => {
      streamTags.push({ indicatorTag: indicator.tag, streamTag: output });
    });
  }

  for (const indicator of indicators) {
    const usedVariables = findUsedVariablesInCode(indicator.funcStr, variableNames);

    // Given the variables present in this indicator's funcStr e.g. $second_value. Loop through variables and add corresponding indicatorTag to dependencies
    const indicatorDependencies = new Set<IndicatorTag>();
    usedVariables.forEach(variable => {
      const matchedIndicator = streamTags.find(
        ({ indicatorTag, streamTag }) => `$${indicatorTag}_${streamTag}` === variable
      );
      if (matchedIndicator) {
        indicatorDependencies.add(matchedIndicator.indicatorTag);
      }
    });
    dependencies.set(indicator.tag as IndicatorTag, Array.from(indicatorDependencies));
  }

  const sortedTags: IndicatorTag[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(tag: IndicatorTag) {
    if (visiting.has(tag)) {
      throw new Error(`Circular dependency detected: ${tag}`);
    }
    if (!visited.has(tag)) {
      visiting.add(tag);
      const deps = dependencies.get(tag) || [];
      deps.forEach(visit);
      visiting.delete(tag);
      visited.add(tag);
      sortedTags.push(tag);
    }
  }

  indicators.forEach(indicator => visit(indicator.tag as IndicatorTag));

  return sortedTags;
}
