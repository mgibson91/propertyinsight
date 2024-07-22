import { buildDelayMapNew } from '@/logic/indicators/build-delay-map-new';
import { ResolvedIndicator } from '@/logic/indicators/resolve-indicator';
import { IndicatorTag } from '@/logic/indicators/types';

const TEST_RESOLVED_INDICATORS: ResolvedIndicator[] = [
  {
    tag: 'sma' as IndicatorTag,
    funcStr: `function indicator() {
  const value = sma(open.slice(0, 2), 2);
  return {
    value,
  };
}`,
    dependsOnIndicatorTags: [],
    outputStreamTags: ['value'],
    length: 2,
  },
  {
    tag: 'channel' as IndicatorTag,
    funcStr: `function indicator() {
  const value = sma(open.slice(0, 2), 2);
  return {
    high: value + 1,
    low: value - 1,
  };
}`,
    dependsOnIndicatorTags: [],
    outputStreamTags: ['high', 'low'],
    length: 4,
  },
  {
    tag: 'derived_sma' as IndicatorTag,
    funcStr: `function indicator() {
  const value = sma(channel_high.slice(0, 2), 2);
  const value1 = sma(channel_low.slice(0, 2), 2);
  return {
    value,
    value1
  };
  }`,
    dependsOnIndicatorTags: ['channel' as IndicatorTag],
    outputStreamTags: ['value', 'value1'],
    length: 6,
  },
  {
    tag: 'double_delayed' as IndicatorTag,
    funcStr: `Doesn't matter`,
    dependsOnIndicatorTags: ['derived_sma' as IndicatorTag],
    outputStreamTags: ['value'],
    length: 10,
  },
];

describe('build delay map', () => {
  test('should build delay map', () => {
    const delayMap = buildDelayMapNew(TEST_RESOLVED_INDICATORS);

    expect(delayMap).toMatchObject({
      sma: 2, // No dependencies
      channel: 4, // No dependencies
      derived_sma: 10, // Depends on channel
      double_delayed: 20, // Depends on derived_sma
    });
  });
});
