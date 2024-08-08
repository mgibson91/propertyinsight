import { CandlestickData, LineData, SeriesMarker, Time, UTCTimestamp } from 'lightweight-charts';
import { MatchingSnapshot } from '@/logic/snapshots/get-matching-snapshots';
import { DARK_COLOR_LIST_10, pickRandom } from '@/shared/color-lists';
import { Indicator } from '@/logic/indicators/types';
import { ResolvedOutcomeEvent } from '@/logic/outcomes/calculate-outcome-events';

export type DisplaySnapshot = {
  candlestickData: CandlestickData[];
  userSeriesData: { overlay: boolean; color: string; lineWidth: 1 | 2 | 3 | 4; data: LineData<Time>[] }[];
  conditionMarker: SeriesMarker<UTCTimestamp>;
  triggerOffset: number;
  outcomeMarker: SeriesMarker<UTCTimestamp>;
  outcomeOffset: number;
  outcomeEvent: ResolvedOutcomeEvent;
};

export function buildDisplaySnapshot(
  snapshot: MatchingSnapshot,
  displayMode: 'light' | 'dark',
  streamTagIndicatorMap: Record<string, Indicator>
): DisplaySnapshot {
  let candlestickData: CandlestickData[] = [];
  let userSeriesMap = new Map<string, LineData<Time>[]>();

  snapshot.data.forEach(d => {
    const { time, open, high, low, close, ...rest } = d;

    candlestickData.push({
      time: d.time,
      open: d.open as number,
      high: d.high as number,
      low: d.low as number,
      close: d.close as number,
    });

    // Iterate through rest, get array if present, create if not and push value with time
    Object.keys(rest).forEach(key => {
      if (!userSeriesMap.has(key)) {
        userSeriesMap.set(key, []);
      }

      userSeriesMap.get(key)?.push({ time, value: rest[key] as number });
    });
  });

  const userSeriesData = Array.from(userSeriesMap).map(([key, data]) => {
    const indicator = streamTagIndicatorMap[key];

    const streamDisplayConfig = indicator.streams.find(s => `${indicator.tag}_${s.tag}` === key);

    return {
      overlay: indicator.overlay,
      color: streamDisplayConfig?.color || pickRandom(DARK_COLOR_LIST_10),
      lineWidth: streamDisplayConfig?.lineWidth || (1 as 1 | 2 | 3 | 4),
      data,
    };
  });

  const conditionMarker: SeriesMarker<UTCTimestamp> = {
    time: snapshot.triggerTimestamp as UTCTimestamp,
    position: 'belowBar',
    color: displayMode === 'dark' ? '#BDE56C' : '#5C7C2F',
    shape: 'arrowUp',
    size: 2,
  };

  const outcomeMarker: SeriesMarker<UTCTimestamp> = {
    time: snapshot.outcomeTimestamp as UTCTimestamp,
    position: snapshot.wasSuccessful ? 'belowBar' : 'aboveBar',
    color:
      snapshot.outcomeEvent.outcome.delta > 0
        ? displayMode === 'dark'
          ? '#1FD8A4'
          : '#208368'
        : displayMode === 'dark'
          ? '#FF977D'
          : '#D13415',
    shape: snapshot.wasSuccessful ? 'arrowUp' : 'arrowDown',
    size: 2,
  };

  const outcomeOffset = snapshot.offsetBetweenTriggerAndOutcome;

  return {
    candlestickData,
    userSeriesData,
    conditionMarker,
    outcomeMarker,
    outcomeOffset,
    triggerOffset: snapshot.triggerOffset,
    outcomeEvent: snapshot.outcomeEvent,
  };
}
