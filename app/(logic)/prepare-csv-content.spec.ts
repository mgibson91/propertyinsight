// import { TEST_MATCHING_SNAPSHOTS } from '@/app/(logic)/prepase-csv-content.mock';
// import { prepareCsvContent } from '@/app/(logic)/prepare-csv-content';
//
// describe('prepareCsvContent', () => {
//   describe('basic', () => {
//     let result: object[];
//     beforeEach(() => {
//       result = prepareCsvContent([TEST_MATCHING_SNAPSHOTS[0]], 2);
//     });
//
//     test('should return expected columns for preceding count', () => {
//       const columns = Object.keys(result[0]);
//
//       for (const expectedColumn of [
//         'open_1',
//         'high_1',
//         'low_1',
//         'close_1',
//         'sma20_1',
//         'sma50_1',
//         'open_2',
//         'high_2',
//         'low_2',
//         'close_2',
//         'sma20_2',
//         'sma50_2',
//       ]) {
//         expect(columns).toContain(expectedColumn);
//       }
//     });
//
//     test('should return a CSV header wi', () => {
//       expect(result).toMatchObject([
//         {
//           high_1: 42969,
//           low_1: 42801,
//           open_1: 42936,
//           close_1: 42930,
//           sma20_1: 42837.4,
//           sma50_1: 42857.7,
//           high_2: 43129,
//           low_2: 42807,
//           open_2: 42835,
//           close_2: 42919,
//           sma20_2: 42810,
//           sma50_2: 42864.6,
//         },
//       ]);
//     });
//   });
// });
//
// /**
//  * First match is at candlestickData[99] with time 1702540800
//   */
//
//
