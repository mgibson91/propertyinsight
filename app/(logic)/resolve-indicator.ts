import { Indicator, IndicatorParam, IndicatorParamType } from '@/logic/indicators/types';
import { findUsedVariablesInCode } from '@/app/(logic)/find-used-variables-in-code';

export interface ResolvedIndicator {
  tag: string;
  length: number;
  funcStr: string; // Must be substituted with params
  dependsOnIndicatorTags: string[]; // e.g. ['sma_20_value'] - no need to specify 'close' as it's always present
  outputStreamTags: string[]; // e.g. ['top_band', 'bottom_band'] referenced as ['bollinger_bands_top_band', 'bollinger_bands_bottom_band']
}

/**
 * Takes in an indicator config, parses the function, and returns:
 * - concrete inputs (other inputs this depends on)
 * - the outputs this function returns
 * @param indicator
 */
export function resolveIndicator({
  indicator,
  inputs,
  allStreamTags,
}: {
  indicator: Omit<Indicator, 'streams' | 'overlay' | 'label'>;
  inputs: Record<string, any>;
  allStreamTags: {
    indicatorTag: string;
    streamTag: string;
  }[];
}): ResolvedIndicator {
  // Substitutes user provider inputs
  const substitutedFuncStr = substituteIndicatorParams({
    funcStr: indicator.funcStr,
    inputs,
    params: indicator.params,
  });

  // References to other indicator streams
  const dependsOnStreamTags = findUsedVariablesInCode(
    substitutedFuncStr,
    allStreamTags.map(({ streamTag }) => streamTag).map(tag => `$${tag}`)
  ).map(tag => tag.slice(1));

  indicator.params.map(param => {
    if (param.type === IndicatorParamType.FIELD && inputs[param.name] !== undefined) {
      dependsOnStreamTags.push(inputs[param.name]);
    }
  });

  // Map dependsOnStreamTags to indicator tags
  const dependsOnIndicatorTags = new Set<string>();
  for (const streamTag of dependsOnStreamTags) {
    const indicatorTag = allStreamTags.find(({ streamTag: tag }) => tag === streamTag)?.indicatorTag;
    if (indicatorTag) {
      dependsOnIndicatorTags.add(indicatorTag);
    }
  }

  let length = 20;
  if (inputs?.length) {
    length = Number(inputs.length);
  } else {
    // Use default if specified - SHOULD ALWAYS BE PRESENT - TODO: Add checks
    const lengthParam = indicator.params.find(param => param.name === 'length');
    length = lengthParam ? Number(lengthParam.defaultValue) : length;
  }

  return {
    tag: indicator.tag, // Purpose for this?
    length,
    funcStr: substitutedFuncStr,
    dependsOnIndicatorTags: Array.from(dependsOnIndicatorTags),
    outputStreamTags: parseFunctionReturnKeys(substitutedFuncStr),
  } satisfies ResolvedIndicator;
}

function substituteIndicatorParams({
  funcStr,
  params,
  inputs,
}: {
  funcStr: string;
  params: IndicatorParam[];
  inputs: Record<string, unknown>;
}): string {
  let funcString = funcStr;

  // Perform substitutions for each parameter in the user's function string
  for (const param of params) {
    funcString = funcString.replaceAll(`$$${param.name}`, `${inputs[param.name] ?? param.defaultValue}` || '');
  }

  return funcString;
}

function parseFunctionReturnKeys(functionString: string) {
  const functionBodyMatch = functionString.match(/return\s*{([\s\S]*?)}/);
  if (!functionBodyMatch) {
    throw new Error('Invalid function string format');
  }

  const returnObjectString = functionBodyMatch[1].trim();
  const keys = returnObjectString
    .split(',')
    .map(pair => pair.split(':')[0].trim())
    .filter(key => key !== '');

  return keys;
}
