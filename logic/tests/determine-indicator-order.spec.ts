import { Indicator, IndicatorTag } from '@/logic/indicators/types';
import { IndicatorStreamMetadata } from '@/logic/get-consolidated-series-new';
import { determineExecutionOrder } from '@/logic/indicators/determine-indicator-order';

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

    const result = determineExecutionOrder({ indicators });
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
        tag: 'third' as IndicatorTag,
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

    const result = determineExecutionOrder({ indicators });
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

    expect(() => determineExecutionOrder({ indicators })).toThrow('Circular dependency detected: first');
  });
});
