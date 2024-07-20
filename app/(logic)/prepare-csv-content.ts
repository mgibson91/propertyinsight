// import { UserSeriesData } from '@/app/(logic)/types';
// import { getConsolidatedSeriesNew } from '@/logic/get-consolidated-series-new';
// import { DisplaySnapshot } from '@/logic/snapshots/build-display-snapshot';
//
// export function prepareCsvContent(displaySnapshots: DisplaySnapshot[], precedingCount: number) {
//   const consolidatedSnapshotEntries: {
//     type: 'success' | 'failure';
//   }[] = [];
//
//   const keys = new Set<string>();
//
//   displaySnapshots.map(displaySnapshot => {
//     if (!displaySnapshot.outcome?.outcomeDetails) {
//       return;
//     }
//
//     const consolidatedSeries = getConsolidatedSeriesNew(
//       displaySnapshot.candlestickData,
//       displaySnapshot.userSeriesData
//     );
//
//     Object.keys(consolidatedSeries.data[consolidatedSeries.data.length - 1]).map(key => keys.add(key));
//     keys.delete('time');
//
//     consolidatedSnapshotEntries.push({
//       type: displaySnapshot.marker.shape === 'arrowUp' ? 'success' : 'failure',
//     });
//   });
//
//   // Loop through all snapshots to format the data
//   const precedingSnapshotData = displaySnapshots.map(snapshot => {
//     const { candlestickData, userSeriesData } = snapshot;
//
//     // Get relevant candlestick data
//     const sortedCandlestickData = candlestickData.sort((a, b) => a.time - b.time);
//     const snapshotCandlestickIndex = sortedCandlestickData.findIndex(candle => candle.time === snapshot.marker.time);
//     const precedingCandlestickData = candlestickData.slice(
//       snapshotCandlestickIndex - precedingCount,
//       snapshotCandlestickIndex
//     );
//
//     // Get relevant user series data (within candle stick window)
//     const precedingUserSeriesData: UserSeriesData[] = userSeriesData.map(series => {
//       const sortedSeriesData = series.data.sort((a: any, b: any) => a.time - b.time);
//       const snapshotSeriesIndex = sortedSeriesData.findIndex((series: any) => series.time === snapshot.marker.time);
//       const preceding = sortedSeriesData.slice(snapshotSeriesIndex - precedingCount, snapshotSeriesIndex);
//       return {
//         ...series,
//         data: preceding.filter(
//           (series: any) =>
//             series.time >= precedingCandlestickData[0].time &&
//             series.time <= precedingCandlestickData[precedingCandlestickData.length - 1].time
//         ),
//       };
//     });
//
//     const consolidatedPrecedingData = getConsolidatedSeriesNew(precedingCandlestickData, precedingUserSeriesData);
//     const reversed = [...consolidatedPrecedingData.data].reverse();
//
//     const result: any = {}; // TODO: Tighten up types
//
//     // Loop through reversed data and return a single row for preceding count in the format [{ open_1, open_2, open_3 }, .etc ] - dont include 0
//     for (let i = 0; i < precedingCount; i++) {
//       for (const key of keys) {
//         result[`${key}_${i + 1}`] = reversed[i][key];
//       }
//     }
//
//     return result;
//   });
//
//   return precedingSnapshotData;
// }
