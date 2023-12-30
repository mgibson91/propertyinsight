import { LineData, OhlcData, SeriesMarker, Time, UTCTimestamp } from "lightweight-charts";
import { FUTURE_VALUE_COUNT, HISTORICAL_VALUE_COUNT } from "@/app/(logic)/values";
import { UserSeriesData } from "@/app/page";
import { ConsolidatedLineData } from "@/logic/calculate-outcomes";

export function calculateTriggers(markerFunctionMap: Map<
  string,
  {
    lookback: number;
    // eslint-disable-next-line @typescript-eslint/ban-types
    func: Function; // (data: ConsolidatedLineData[]) => boolean;
  }
>, consolidatedSeries: ConsolidatedLineData[], newUserSeriesData: {
  name: string;
  overlay: boolean;
  data: LineData<UTCTimestamp>[];
  color: string;
  lineWidth: 1 | 2 | 3 | 4;
}[]) {

  const matchingMarkers: SeriesMarker<UTCTimestamp>[] = [];
  const conditionMarkers: {
    marker: SeriesMarker<UTCTimestamp>;
    candlestickData: OhlcData<UTCTimestamp>[];
    userSeriesData: UserSeriesData[];
    historicalCandles: number;
  }[] = [];

  for (const [name, { lookback, func }] of markerFunctionMap) {
    // Check if there are any matches
    for (let i = 0; i < consolidatedSeries.length; i++) {
      if (lookback > i) {
        continue;
      }

      // We reverse it to mirror trading view data[0] = now, data[1] = 1 candle ago
      const reversedLookbackSeries = consolidatedSeries
        .slice(i - lookback, i)
        .reverse();
      if (func(reversedLookbackSeries)) {
        // TODO: make dynamic from config
        const marker: SeriesMarker<UTCTimestamp> = {
          time: consolidatedSeries[i - 1].time as UTCTimestamp,
          text: (matchingMarkers.length + 1).toString(),
          position: 'belowBar',
          color: '#D1FE77E4',
          shape: 'arrowUp',
          size: 3,
        };

        matchingMarkers.push(marker);

        const snapshotLookback = i > HISTORICAL_VALUE_COUNT ? HISTORICAL_VALUE_COUNT : i;

        // const dataSlice = consolidatedSeries.slice(i - snapshotLookback, i);
        const dataSlice = consolidatedSeries.slice(
          i - snapshotLookback,
          i + FUTURE_VALUE_COUNT
        );
        const candlestickData = dataSlice.map(
          ({ high, low, open, close, time }) => ({
            high,
            low,
            open,
            close,
            time,
          })
        );

        const timeDiff = dataSlice[1].time - dataSlice[0].time;

        for (let y = 0; y < (HISTORICAL_VALUE_COUNT - i); y++) {
          // Add null values to the beginning of the array for all candlestick data streams
          candlestickData.unshift({
            // TODO: Fix this type hack. OhlcData doesn't allow undefined values but they work as expected
            high: undefined as unknown as number,
            low: undefined  as unknown as number,
            open: undefined  as unknown as number,
            close: undefined  as unknown as number,
            time: dataSlice[0].time - (timeDiff * (y + 1)) as UTCTimestamp,
          });
        }

        const userSeriesMap = new Map<string, LineData<UTCTimestamp>[]>();

        for (const dataPoint of dataSlice) {
          for (const [key, value] of Object.entries(dataPoint)) {
            if (['time', 'high', 'low', 'open', 'close'].includes(key)) {
              continue;
            }

            if (!userSeriesMap.has(key)) {
              const userSeries = newUserSeriesData.find(
                (series) => series.name === key
              );
              if (userSeries) {
                userSeriesMap.set(key, []);
              }
            }

            userSeriesMap.get(key)?.push({
              time: dataPoint.time as UTCTimestamp,
              value: value as number,
            });
          }
        }

        // Concert userSeriesMap to array of UserSeriesData
        const adjacentUserSeriesData: UserSeriesData[] = [];
        for (const [name, data] of userSeriesMap) {
          const userSeries = newUserSeriesData.find(
            (series) => series.name === name
          );
          if (userSeries) {
            const backfilledData = [...data];

            const userSeriesEmptyValues = dataSlice.length - data.length;
            // const userSeriesEmptyValues = 0;
            const backfillCount = Math.max(userSeriesEmptyValues, HISTORICAL_VALUE_COUNT - i + userSeriesEmptyValues);

            for (let y = 0; y < backfillCount; y++) {
              // Add null values to the beginning of the array for all candlestick data streams
              backfilledData.unshift({
                time: dataSlice[0].time - (timeDiff * (y + 1)) as UTCTimestamp,
                // TODO: Fix this type hack. OhlcData doesn't allow undefined values but they work as expected
                value: undefined as unknown as number,
              });
            }

            adjacentUserSeriesData.push({
              name: userSeries.name,
              overlay: userSeries.overlay,
              data: backfilledData,
              color: userSeries.color,
              lineWidth: userSeries.lineWidth,
            });
          }
        }

        conditionMarkers.push({
          marker,
          candlestickData: candlestickData.sort((a, b) => a.time - b.time),
          userSeriesData: adjacentUserSeriesData.map((series) => ({
            ...series,
            data: series.data.sort((a, b) => a.time - b.time),
          })),
          historicalCandles: Math.min(i, HISTORICAL_VALUE_COUNT)
        });
      }
    }
  }

  return {
    matchingMarkers: matchingMarkers.sort((a, b) => a.time - b.time),
    conditionMarkers
  };
}