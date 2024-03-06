import { LineData, OhlcData, SingleValueData, Time, UTCTimestamp } from 'lightweight-charts';
import { ConsolidatedLineData } from '@/logic/calculate-outcomes';
import { EnrichedOhlcData, GenericData, UserSeriesData } from '@/app/(logic)/types';
import { Indicator, IndicatorParam } from '@/logic/indicators/types';
import { prefixBuiltInFunctions } from '@/logic/built-in-functions/prefix-built-in-functions';
import { buildIndicatorDelayMap } from '@/app/(logic)/build-indicator-delay-map';

function buildIndicatorStreamVariables(existingIndicatorStreamss: IndicatorStreamData[]): string {
  let lines: string[] = [];

  for (const indicatorStream of existingIndicatorStreamss) {
    lines.push(
      `const ${indicatorStream.indicator.tag}_${indicatorStream.tag} = inputData.map(d => (d && d.${indicatorStream.indicator.tag} && d.${indicatorStream.indicator.tag}.${indicatorStream.tag}) ? d.${indicatorStream.indicator.tag}.${indicatorStream.tag} : null);`
    );
  }

  return lines.join('\n');
}

function prependSpreadFunctions(
  funcString: string,
  indicator: Indicator,
  existingIndicatorStreams: IndicatorStreamData[]
): string {
  const params = indicator.params;

  let adjustedFunc = `
const inputData = data.data;  
const open = inputData.map(d => d.open);
const high = inputData.map(d => d.high);
const low = inputData.map(d => d.low);
const close = inputData.map(d => d.close);

${params.map(({ name }) => `const ${name} = data.${name};`).join('\n')}

${buildIndicatorStreamVariables(existingIndicatorStreams)}

// const length = data.length;

// TODO: Access everything else


//--- USER DEFINED ---
${funcString}`;

  // TODO: extract this elsewhere
  for (const param of params) {
    adjustedFunc = adjustedFunc.replaceAll(`$${param.name}`, `${param.value ?? param.defaultValue}` || '');
  }

  return adjustedFunc;
}

export interface IndicatorStreamData {
  indicator: Indicator;
  indicatorTag: string; // TODO: Delete
  tag: string;
  data: LineData<UTCTimestamp>[];
}

// Purely calculate indicator data - multiple streams
function calculateIndicatorData(
  batchSize: number,
  data: EnrichedOhlcData[],
  indicator: Indicator,
  existingIndicatorStreams: IndicatorStreamData[]
): IndicatorStreamData[] {
  if (!data || !data?.length) {
    console.error('No data to calculate indicator');
    return [];
  }

  const batches: GenericData[][] = [];
  for (let i = 0; i < data.length - batchSize + 1; i++) {
    const batch = data.slice(i, i + batchSize);
    batches.push(batch);
  }

  // Get params from configured indicator params using name and value | default
  const params: Record<string, unknown> = {};

  indicator.params.forEach(param => {
    params[param.name] = param.value ?? param.defaultValue;
  });

  // If indicator is dependent on other indicators, recursively calculate length

  const indicatorFunc = new Function(
    'data',
    'cache',
    prependSpreadFunctions(prefixBuiltInFunctions(indicator.funcStr), indicator, existingIndicatorStreams)
  );

  let cache = {};
  // Initialize a Map to store unique results
  const uniqueResultsMap = new Map<string, LineData<UTCTimestamp>[]>();

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    // TODO: Verify params contains length: 20
    // TODO: Verify params can be changed via UI
    const { cache: cacheUpdate, ...indicatorData } = indicatorFunc({ data: batch, ...params }, cache);
    cache = { ...cache, ...cacheUpdate };

    // NOTE: At this point we KNOW the output fields of the indicator (dynamically determine at input time)

    // Iterate through the keys in indicatorData to update uniqueResultsMap
    Object.keys(indicatorData).forEach(key => {
      // TODO: We receive { sma, ema, rsi } etc. - we need to split them into separate streams with { time, value }
      // There might specific names associated however
      if (!uniqueResultsMap.has(key)) {
        uniqueResultsMap.set(key, []);
      }

      // Why on earth do I need this?
      // TODO: Instead of calculating everything and then only taking values after data is present - consider not calcuating

      const firstValidOffset = i + batchSize - 1;
      if (data[firstValidOffset]?.time) {
        uniqueResultsMap.get(key)!.push({ time: data[firstValidOffset].time, value: indicatorData[key] });
      }

      // uniqueResultsMap.get(key)!.push({ time: data[i + batchSize - 1].time, value: indicatorData[key] });
    });
  }

  // Convert Map to an array of arrays
  // const resultArray = Array.from(uniqueResultsMap, ([key, value]) => value);

  const streams: IndicatorStreamData[] = [];

  for (const [tag, data] of uniqueResultsMap.entries()) {
    streams.push({
      indicatorTag: indicator.tag,
      indicator,
      tag,
      data,
    });
  }

  // If you need to include the prependData in the result, you can add it to each array in resultArray
  // Depending on how you want to include prependData, you might adjust this step.
  // For demonstration, prependData is not directly included in the conversion process above.

  return streams;
}

function mergeIndicatorStreamWithOriginalData(
  indicatorData: IndicatorStreamData[],
  originalData: GenericData[]
): GenericData[] {
  const result = [...originalData];

  for (const stream of indicatorData) {
    // Merge the indicator data with the original data based on time
    for (const dataPoint of stream.data) {
      const originalIndex = result.findIndex(d => d.time === dataPoint.time);
      if (originalIndex !== -1) {
        const { time, ...nonTimeData } = dataPoint;

        const existingData = (result[originalIndex] as any)[stream.indicatorTag] || {};

        result[originalIndex] = {
          ...result[originalIndex],
          [stream.indicatorTag]: {
            ...existingData,
            [stream.tag]: nonTimeData.value,
          },
        };
      }
    }
  }

  return result;
}

function calculateMaxIndicatorDepedencyDelay(indicator: Indicator, indicatorDelayMap: Map<string, number>) {
  let indicatorDependencyDelay = 0;

  // Get params from configured indicator params using name and value | default
  const params: Record<string, unknown> = {};

  indicator.params.forEach(param => {
    params[param.name] = param.value ?? param.defaultValue;
  });

  for (const param of Object.values(params)) {
    if (typeof param !== 'string') continue;

    const delay = indicatorDelayMap.get(param) || 0;
    indicatorDependencyDelay = Math.max(indicatorDependencyDelay, delay);
  }

  return indicatorDependencyDelay;
}

export function getConsolidatedSeries(
  candleData: OhlcData<UTCTimestamp>[],
  userSeriesData: UserSeriesData[],
  userIndicators: Indicator[]
): { consolidatedSeries: GenericData[]; indicatorStreams: IndicatorStreamData[] } {
  const consolidatedSeries: OhlcData<UTCTimestamp>[] = [];

  for (const candle of candleData) {
    // Initialize an object with time key
    const obj = {
      time: candle.time,
    } as ConsolidatedLineData;

    // Add the candle data for this time
    obj.time = candle.time as UTCTimestamp;
    obj.high = candle.high;
    obj.low = candle.low;
    obj.open = candle.open;
    obj.close = candle.close;

    // // Add the user series data for this time if available
    // userSeriesData.forEach(series => {
    //   // Find the corresponding data point in user series by time
    //   const seriesDataPoint = series.data.find(d => d.time === candle.time);
    //   if (seriesDataPoint) {
    //     obj[series.name] = seriesDataPoint.value;
    //   }
    // });

    // userIndicators.forEach(indicator => {
    //   // Find the corresponding data point in user series by time
    //   const indicatorDataPoint = indicator.data.find(d => d.time === candle.time);
    //   if (indicatorDataPoint) {
    //     obj[indicator.id] = indicatorDataPoint.value;
    //   }
    // });

    // consolidatedSeries.push(obj);
    consolidatedSeries.push(candle);
  }

  let result = [...consolidatedSeries] as unknown as GenericData[];

  const indicatorStreams: IndicatorStreamData[] = [];
  const indicatorDelayMap = buildIndicatorDelayMap(userIndicators);

  for (const indicator of userIndicators) {
    // TODO: Dynamically check out the batch size - abstracted from the user
    // TODO: Pass in params according to config e.g. sma 'length'
    // NOTE: If dynamically calculating - we need to be aware that user might go for close(20) or close(length) where
    // length itself is a param. So we might need a two step resolve right back to user params

    // Give the indicator params, check the delay map to see if it's dependent on other indicators and if so,
    // the longest delay required until all indiciators are ready
    const indicatorDependencyDelay = calculateMaxIndicatorDepedencyDelay(indicator, indicatorDelayMap);

    // Assuming hardcoded length for now. Optimal solution however is to dynamically determine the min length required
    const batchSize = indicator.params.find(param => param.name === 'length')?.value as number;
    // const batchSize = 20;
    // console.log('batchSize', batchSize);

    if (!batchSize) {
      throw new Error('Indicator length not found');
    }

    const calculatedIndicatorStream = calculateIndicatorData(
      batchSize,
      (result as EnrichedOhlcData[]).slice(indicatorDependencyDelay),
      indicator,
      indicatorStreams
    );

    for (const stream of calculatedIndicatorStream) {
      // const streamStyle = indicator.streams.find(style => style.id === stream.id);

      indicatorStreams.push({
        tag: stream.tag,
        indicator,
        indicatorTag: indicator.tag,
        data: stream.data,
      });

      result = mergeIndicatorStreamWithOriginalData(indicatorStreams, result);
    }

    // indicatorStream.push({
    //   tag: indicator.tag,
    //   data: indicatorData,
    // });

    // TODO: Add to result so further indicators can use it

    // const indicatorSpecific = calculateIndicatorData(20, candleData, indicator);
    //
    // // Merge ajudsted data with the result
    // for (let i = 0; i < result.length; i++) {
    //   result[i] = { ...result[i], ...indicatorSpecific[i] };
    // }

    // const adjusted = calculateIndicatorData(20, candleData, indicator);
    // consolidatedSeries.push(...adjusted);
  }

  return { consolidatedSeries: result, indicatorStreams }; // yolo
}
