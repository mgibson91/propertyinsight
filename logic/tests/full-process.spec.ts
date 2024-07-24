import { Indicator, IndicatorParamType, IndicatorTag } from '@/logic/indicators/types';
import { OhlcData, UTCTimestamp } from 'lightweight-charts';
import { GenericData } from '@/app/(logic)/types';
import { getConsolidatedSeriesNew } from '../get-consolidated-series-new';
import { TriggerId } from '@/components/triggers/edit-trigger';
import { calculateTriggerEvents } from '@/logic/triggers/calculate-trigger-events';
import { calculateOutcomeEvents } from '@/logic/outcomes/calculate-outcome-events';
import { OutcomeId } from '@/logic/outcomes/types';

const INCREMENTING_CANDLE_DATA = new Array(20).fill(10).map(
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
    tag: 'sma' as IndicatorTag,
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
    id: '1a',
    tag: 'steep' as IndicatorTag,
    funcStr: `function indicator() {
  cache.level = cache.level != null ? cache.level + 2 : -2; // start -5 to intercept test data

  return {
    level: cache.level,
  };
}`,
    properties: ['level'],
    params: [
      {
        name: 'length',
        type: IndicatorParamType.NUMBER,
        label: 'Length',
        required: true,
        defaultValue: 1,
        value: 1,
      },
    ],
  },
  {
    id: '1b',
    tag: 'super_steep' as IndicatorTag,
    funcStr: `function indicator() {
  cache.level = cache.level != null ? cache.level + 3 : -23;

  return {
    level: cache.level,
  };
}`,
    properties: ['level'],
    params: [
      {
        name: 'length',
        type: IndicatorParamType.NUMBER,
        label: 'Length',
        required: true,
        defaultValue: 1,
        value: 1,
      },
    ],
  },
  {
    id: '2',
    tag: 'channel' as IndicatorTag,
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
    const { data, streams, delayMap } = getConsolidatedSeriesNew({
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

    const triggerEvents = calculateTriggerEvents({
      data,
      streams,
      delayMap,
      triggers: [
        {
          id: '1' as TriggerId,
          name: 'Test Trigger',
          conditions: [
            {
              fieldA: {
                property: 'steep_level',
                offset: 0,
              },
              operator: {
                type: 'crossover',
              },
              fieldB: {
                property: 'sma_value',
                offset: 0,
              },
            },
          ],
          enabled: true,
        },
      ],
      streamTagIndicatorMap: {},
    });
    expect(Object.keys(triggerEvents)).toEqual(['1']);

    const outcomes = calculateOutcomeEvents({
      data,
      streams,
      triggerEvents,
      outcomeConfigs: [
        {
          id: '1' as OutcomeId,
          name: 'Test Outcome',
          enabled: true,
          successConditions: [
            {
              fieldA: {
                property: 'super_steep_level',
                offset: 0,
              },
              operator: {
                type: 'crossover',
                custom: false,
              },
              fieldB: {
                property: 'sma_value',
                offset: 0,
              },
            },
          ],
        },
      ],
    });

    expect(Object.keys(outcomes)).toHaveLength(1);
  });
});
