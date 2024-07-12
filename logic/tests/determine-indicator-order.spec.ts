import { Indicator, IndicatorTag } from '@/logic/indicators/types';
import { findUsedVariablesInCode } from '@/app/(logic)/find-used-variables-in-code';
import { parseFunctionReturnKeys } from '@/app/(logic)/parse-function-return-key';
import { IndicatorStreamMetadata } from '@/logic/get-consolidated-series-new';

describe('determineExecutionOrder', () => {
  it('should determine the correct order with no circular dependency (simple case)', () => {
    const indicators: Pick<Indicator, 'tag' | 'funcStr'>[] = [
      {
        tag: 'first' as IndicatorTag,
        funcStr: `function indicator() {
          return {
            value: $close[0] + 1,
          };
        }`,
      },
      {
        tag: 'second' as IndicatorTag,
        funcStr: `function indicator() {
          return {
            value: $first_value[0] + 1,
          };
        }`,
      },
    ];

    const metadata: IndicatorStreamMetadata[] = [
      {
        streamTag: 'value',
        indicatorTag: 'first' as IndicatorTag,
      },
      {
        streamTag: 'value',
        indicatorTag: 'second' as IndicatorTag,
      },
    ];

    const result = determineExecutionOrder(indicators, metadata);
    expect(result).toEqual(['first', 'second']);
  });

  it('should determine the correct order with no circular dependency (linear chain)', () => {
    const indicators: Pick<Indicator, 'tag' | 'funcStr'>[] = [
      {
        tag: 'first' as IndicatorTag,
        funcStr: `function indicator() {
          return {
            value: close[0] + 1,
          };
        }`,
      },
      {
        tag: 'second' as IndicatorTag,
        funcStr: `function indicator() {
          return {
            value: $first_value[0] + 1,
          };
        }`,
      },
      {
        tag: 'third' as IndicatorTag,
        funcStr: `function indicator() {
          return {
            value: $second_value[0] + 1,
          };
        }`,
      },
    ];

    const metadata: IndicatorStreamMetadata[] = [
      {
        streamTag: 'value',
        indicatorTag: 'first' as IndicatorTag,
      },
      {
        streamTag: 'value',
        indicatorTag: 'second' as IndicatorTag,
      },
      {
        streamTag: 'value',
        indicatorTag: 'third' as IndicatorTag,
      },
    ];

    const result = determineExecutionOrder(indicators, metadata);
    expect(result).toEqual(['first', 'second', 'third']);
  });

  it('should throw an error for circular dependency', () => {
    const indicators: Pick<Indicator, 'tag' | 'funcStr'>[] = [
      {
        tag: 'first' as IndicatorTag,
        funcStr: `function indicator() {
          return {
            value: $second_value[0] + 1,
          };
        }`,
      },
      {
        tag: 'second' as IndicatorTag,
        funcStr: `function indicator() {
          return {
            value: $first_value[0] + 1,
          };
        }`,
      },
    ];

    const metadata = [
      {
        streamTag: 'value',
        indicatorTag: 'first' as IndicatorTag,
      },
      {
        streamTag: 'value',
        indicatorTag: 'second' as IndicatorTag,
      },
    ];

    expect(() => determineExecutionOrder(indicators, metadata)).toThrow('Circular dependency detected: first');
  });
});

export function determineExecutionOrder(
  indicators: Pick<Indicator, 'tag' | 'funcStr'>[],
  indicatorStreams: IndicatorStreamMetadata[]
): IndicatorTag[] {
  const variableNames = indicators
    .map(indicator => parseFunctionReturnKeys(indicator.funcStr).map(key => `$${indicator.tag}_${key}`))
    .flat();
  const dependencies = new Map<IndicatorTag, IndicatorTag[]>();

  for (const indicator of indicators) {
    const usedVariables = findUsedVariablesInCode(indicator.funcStr, variableNames);

    // Given the variables present in this indicator's funcStr e.g. $second_value. Loop through variables and add corresponding indicatorTag to dependencies
    const indicatorDependencies = new Set<IndicatorTag>();
    usedVariables.forEach(variable => {
      const matchedIndicator = indicatorStreams.find(
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
