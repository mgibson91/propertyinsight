import { LineData, OhlcData, SeriesMarker, Time } from "lightweight-charts";
import { ConsolidatedLineData, FUTURE_VALUE_COUNT, HISTORICAL_VALUE_COUNT, UserSeriesData } from "@/app/page";

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
  data: LineData<Time>[];
  color: string;
  lineWidth: number;
}[]) {

  const matchingMarkers: SeriesMarker<Time>[] = [];
  const conditionMarkers: {
    marker: SeriesMarker<Time>;
    candlestickData: OhlcData<Time>[];
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
        const marker: SeriesMarker<Time> = {
          time: consolidatedSeries[i - 1].time,
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
            high: undefined,
            low: undefined,
            open: undefined,
            close: undefined,
            time: dataSlice[0].time - (timeDiff * (y + 1)),
          });
        }

        const userSeriesMap = new Map<string, LineData<Time>[]>();

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
              time: dataPoint.time,
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
                time: dataSlice[0].time - (timeDiff * (y + 1)),
                value: undefined,
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