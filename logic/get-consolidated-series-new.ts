import { GenericData } from '@/app/(logic)/types';
import { Indicator, IndicatorParam, IndicatorTag } from '@/logic/indicators/types';
import { LineData, UTCTimestamp } from 'lightweight-charts';
import { prefixBuiltInFunctions } from '@/logic/built-in-functions/aggregations/prefix-built-in-functions';
import { ResolvedIndicator, resolveIndicator } from '@/logic/indicators/resolve-indicator';
import { resolveAllIndicatorStreamTags } from '@/app/(logic)/resolve-all-indicator-stream-tags';
import { buildDelayMapNew } from '@/logic/indicators/build-delay-map-new';
import { determineExecutionOrder } from '@/logic/indicators/determine-indicator-order';

export interface IndicatorStreamData {
  indicator: Indicator;
  tag: string;
  data: LineData<UTCTimestamp>[];
}

export interface IndicatorStreamMetadata {
  streamTag: string;
  indicatorTag: IndicatorTag;
}

export function getConsolidatedSeriesNew(input: {
  data: GenericData[];
  defaultFields: string[];
  indicatorInputMap?: Record<string, object>;
  indicators: Omit<Indicator, 'streams' | 'overlay' | 'label'>[];
}): {
  streams: IndicatorStreamMetadata[];
  data: GenericData[];
  delayMap: Record<string, number>;
  defaultFields: string[];
} {
  const { data, defaultFields, indicators, indicatorInputMap } = input;

  // Step 1: Resolve all stream tags so we can determine calculator order
  const allStreamTags = resolveAllIndicatorStreamTags(indicators);

  // Step 2: Resolve each indicator - substitutes code and codifies inputs / outputs
  const resolvedIndicators = indicators.map((indicator, index) => {
    return resolveIndicator({
      indicator,
      inputs: indicatorInputMap?.[indicator.tag] || {},
      allStreamTags,
    });
  });

  // Step 3: Execute each indicator in order
  const delayMap = buildDelayMapNew(resolvedIndicators);

  // Step 4: Consolidate the initial data
  const consolidatedSeries: GenericData[] = [];

  for (const entry of data) {
    // Initialize an object with time key
    const obj: GenericData = {
      time: entry.time,
    };

    // Add the candle data for this time
    obj.time = entry.time as UTCTimestamp;

    for (const field of defaultFields) {
      obj[field] = entry[field];
    }

    consolidatedSeries.push(entry);
  }

  // Step 5: Calculate indicator data for each given their 'offset' and 'length'
  const { streams, data: indicatorAugmentedData } = augmentDataWithIndicatorStreams({
    data: consolidatedSeries,
    delayMap,
    resolvedIndicators,
  });

  return { data: indicatorAugmentedData, streams, defaultFields, delayMap };
}

function augmentDataWithIndicatorStreams({
  data,
  delayMap,
  resolvedIndicators,
}: {
  data: GenericData[];
  delayMap: Record<string, number>;
  resolvedIndicators: ResolvedIndicator[];
}): { streams: IndicatorStreamMetadata[]; data: GenericData[] } {
  const augmentedData = [...data];

  const existingIndicatorMetadata: IndicatorStreamMetadata[] = [];

  const order = determineExecutionOrder({ indicators: resolvedIndicators });

  // Step 5: Calculate indicator data for each given their 'offset' and 'length'
  for (const indicatorTag of order) {
    const resolvedIndicator = resolvedIndicators.find(indicator => indicator.tag === indicatorTag);

    if (!resolvedIndicator) {
      console.error(`Indicator ${indicatorTag} not found in resolvedIndicators`);
      continue;
    }

    const offset = delayMap[resolvedIndicator.tag] || 0;

    const evaluatedFunc = prependSpreadFunctions({
      funcString: `${prefixBuiltInFunctions(resolvedIndicator.funcStr)}

// Call the user provided function
return indicator();`,
      existingIndicatorMetadata,
    });

    const indicatorFunc = new Function('data', 'cache', evaluatedFunc);

    // TODO: Cache?
    let cache = {};

    for (let i = offset; i < augmentedData.length; i++) {
      const batch =
        resolvedIndicator.length === 0 ? [augmentedData[i]] : augmentedData.slice(i - resolvedIndicator.length, i);
      const reversedBatch = batch.slice().reverse();

      // TODO: Add inputs here
      // indicatorFunc({ data: batch }, cache);
      const result = indicatorFunc({ data: reversedBatch }, cache);

      for (const streamTag of resolvedIndicator.outputStreamTags) {
        augmentedData[i][`${resolvedIndicator.tag}_${streamTag}`] = result[streamTag];
      }
    }

    resolvedIndicator.outputStreamTags.map(streamTag => {
      existingIndicatorMetadata.push({
        indicatorTag: resolvedIndicator.tag,
        streamTag,
      });
    });
  }

  // // Step 5: Calculate indicator data for each given their 'offset' and 'length'
  // for (const resolvedIndicator of resolvedIndicators) {
  //   /**
  //    * Get offset
  //    * Create function from resolvedIndicator.funcStr
  //    * From offset -> end pass batch to function
  //    * Add result to data (for each output stream)
  //    */
  //
  //
  // }

  return {
    streams: existingIndicatorMetadata,
    data: augmentedData,
  };
}

export function prependSpreadFunctions({
  funcString,
  existingIndicatorMetadata,
}: {
  funcString: string;
  existingIndicatorMetadata: { streamTag: string; indicatorTag: IndicatorTag }[];
}): string {
  let adjustedFunc = `
const inputData = data.data;
const open = inputData.map(d => d.open);
const high = inputData.map(d => d.high);
const low = inputData.map(d => d.low);
const close = inputData.map(d => d.close);

${buildIndicatorStreamVariables(existingIndicatorMetadata)}

//--- USER DEFINED - must have indicator() ---
${funcString}
`;

  return adjustedFunc;
}

export function buildIndicatorStreamVariables(existingIndicatorStreams: IndicatorStreamMetadata[]): string {
  let lines: string[] = [];

  for (const indicatorStream of existingIndicatorStreams) {
    lines.push(
      // `const $${indicatorStream.indicatorTag}_${indicatorStream.streamTag} = inputData.map(d => (d && d.${indicatorStream.indicatorTag} && d.${indicatorStream.indicatorTag}.${indicatorStream.streamTag}) ? d.${indicatorStream.indicatorTag}.${indicatorStream.streamTag} : null);`
      `const $${indicatorStream.indicatorTag}_${indicatorStream.streamTag} = inputData.map(d => d.${indicatorStream.indicatorTag}_${indicatorStream.streamTag} ?? null);`
    );
  }

  return lines.join('\n');
}
