import { Indicator, IndicatorParamType } from '@/logic/indicators/types';
import { OhlcData, UTCTimestamp } from 'lightweight-charts';
import { GenericData } from '@/app/(logic)/types';
import { getConsolidatedSeriesNew } from './get-consolidated-series-new';
import { Trigger } from "@/components/triggers/edit-trigger";
import { calculateTriggers } from "@/logic/calculate-triggers";
import { buildTriggerFunc } from "@/app/(logic)/build-trigger-functions";

const INCREMENTING_CANDLE_DATA = new Array(10).fill(0).map(
  (val, i) =>
    ({
      time: i,
      close: i + val,
      open: i + val,
      high: i + val + 1,
      low: i + val - 1,
    }) as OhlcData<UTCTimestamp>
);

const TEST_INDICATORS: Omit<Indicator, 'streams' | 'overlay' | 'label'>[] = [
  {
    id: '1',
    tag: 'sma',
    funcStr: `function indicator() {
  const value = sma($$field.slice(0, $$length), $$length);
  
  cache.incrementer = (cache.incrementer ?? -1) + 1;
  
  return {
    value,
    line: cache.incrementer,
  };
}`,
    params: [
      {
        name: 'length',
        type: IndicatorParamType.NUMBER,
        label: 'Length',
        required: true,
        defaultValue: 20,
        value: 20,
      },
      {
        name: 'field',
        type: IndicatorParamType.FIELD,
        label: 'Field',
        required: true,
        defaultValue: 'close',
        value: 'close',
      },
    ],
    properties: ['value'],
  },
  {
    id: '2',
    tag: 'channel',
    funcStr: `function indicator() {
  const value = sma($$field.slice(0, $$length), $$length);
  return {
    high_channel: value + 1,
    low_channel: value - 1,
  };
}`,
    params: [
      {
        name: 'length',
        type: IndicatorParamType.NUMBER,
        label: 'Length',
        required: true,
        defaultValue: 20,
        value: 20,
      },
      {
        name: 'field',
        type: IndicatorParamType.FIELD,
        label: 'Field',
        required: true,
        defaultValue: 'close',
        value: 'close',
      },
    ],
    properties: ['high', 'low'],
  },
  // TODO: Example with substituted field
];

describe('full process', () => {
  test('should resolve', () => {
    const result = getConsolidatedSeriesNew({
      data: INCREMENTING_CANDLE_DATA as unknown as GenericData[],
      defaultFields: [],
      indicatorInputMap: {
        sma: {
          length: 2,
          field: 'open',
        },
        channel: {
          length: 5,
          field: '$sma_value',
        },
      },
      indicators: TEST_INDICATORS,
    });

    const triggerEvents =

    console.log(result);
  });
});

function getTriggerEvents({ data, triggers }: { data: GenericData[]; triggers: Trigger[] }) {
  const markerFunctionMap = new Map<
    string,
    {
      lookback: number;
      func: Function; // (data: ConsolidatedLineData[]) => boolean;
    }
  >();

  /**
   * 1. Build initial functions (store generated function names)
   * 2. Build calculation function
   * 3. Iterate through data calculating each function
   *    - For now, expect trigger code to only operate on valid data (if (close[0])
   * 4. Look at dynamically detecting function length
   */

  // Just give the current arrays as params and let marker funcs do their job
  for (const trigger of triggers) {
    markerFunctionMap.set(trigger.name, {
      // TODO: Consider this - should in theory be the min required but hardcoded for display ease
      // lookback: HISTORICAL_VALUE_COUNT,
      lookback: 50,
      func: new Function('data', trigger.),
    });
  }


  const triggerFunctionMap = new Map<string, Function>();

  for (const trigger of triggers) {
    const funcStr = buildTriggerFunc(trigger);

    triggerFunctionMap.set(trigger.name, new Function('data', 'cache', funcStr));

    for ()



    const func = new Function('data', 'cache', )
  }

  // Output format is SeriesMarker<UTCTimestamp>[]

  // The one thing we need to do is give the condition logic enough data to work with.
  // E.g. crossover(close,100) will fail if there aren't enough data points
  // Up to user for now!!!!!!!!!!!!!!!

  for (let i=0; i<=data.length; i++) {

  }


  // // 2. matchingMarkers is ready to go
  // const { matchingMarkers, conditionMarkers } = calculateTriggers(
  //   markerFunctionMap,
  //   consolidatedSeries,
  //   newUserSeriesData as UserSeriesData[],
  //   displayMode.mode === 'dark'
  // );
}