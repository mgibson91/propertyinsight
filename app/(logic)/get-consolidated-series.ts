import { OhlcData, Time, UTCTimestamp } from "lightweight-charts";
import { ConsolidatedLineData } from "@/logic/calculate-outcomes";
import { UserSeriesData } from "@/app/(logic)/types";

export function getConsolidatedSeries(
  candleData: OhlcData<UTCTimestamp>[],
  userSeriesData: UserSeriesData[]
): ConsolidatedLineData[] {
  const consolidatedSeries: ConsolidatedLineData[] = [];

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

    // Add the user series data for this time if available
    userSeriesData.forEach((series) => {
      // Find the corresponding data point in user series by time
      const seriesDataPoint = series.data.find((d) => d.time === candle.time);
      if (seriesDataPoint) {
        obj[series.name] = seriesDataPoint.value;
      }
    });

    consolidatedSeries.push(obj);
  }

  return consolidatedSeries;
}