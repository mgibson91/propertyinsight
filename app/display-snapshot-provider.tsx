// 'use client'
//
// import React, { createContext, useState, useContext } from 'react';
// import { OhlcData, SeriesMarker, Time, UTCTimestamp } from "lightweight-charts";
// import { UserSeriesData } from "@/app/(logic)/types";
//
// export interface DisplaySnapshot {
//   marker: SeriesMarker<UTCTimestamp>;
//   candlestickData: OhlcData<UTCTimestamp>[];
//   userSeriesData: UserSeriesData[];
//   outcome?: {
//     marker: SeriesMarker<Time>;
//     outcomeDetails: {
//       offset: number;
//       value: number;
//       text: string;
//     };
//   };
//   historicalCandles: number;
// }
//
// // Create a context with a default empty value
// const DisplaySnapshotContext = createContext<[DisplaySnapshot[], React.Dispatch<React.SetStateAction<DisplaySnapshot[]>>]>([[], () => {}]);
//
// // Create a provider component
// export const DisplaySnapshotProvider = ({ children }: { children: React.ReactNode }) => {
//   const [DisplaySnapshot, setDisplaySnapshot] = useState<DisplaySnapshot[]>([]); // Initialize with null or any default value
//
//   // The value prop of the provider will be our context data
//   // Include any methods you want to make available to children
//   const value = {
//     DisplaySnapshot,
//     setDisplaySnapshot, // Allow children to update the DisplaySnapshot
//   };
//
//   return (
//     <DisplaySnapshotContext.Provider value={[DisplaySnapshot, setDisplaySnapshot]}>
//       {children}
//     </DisplaySnapshotContext.Provider>
//   );
// };
//
// // Custom hook that components can use to access the context value
// export const useDisplaySnapshot = () => {
//   const context = useContext(DisplaySnapshotContext);
//   if (context === undefined) {
//     throw new Error('useDisplaySnapshot must be used within a DisplaySnapshotProvider');
//   }
//   return context;
// };
//

'use client';

import React, { createContext, useContext, useState } from 'react';
import { DisplaySnapshot } from '@/logic/snapshots/build-display-snapshot';

// Create a context with a default empty value
const DisplaySnapshotContext = createContext<
  [DisplaySnapshot[], React.Dispatch<React.SetStateAction<DisplaySnapshot[]>>]
>([[], () => {}]);

// Create a provider component
export const DisplaySnapshotProvider = ({ children }: { children: React.ReactNode }) => {
  const [DisplaySnapshot, setDisplaySnapshot] = useState<DisplaySnapshot[]>([]); // Initialize with null or any default value

  // The value prop of the provider will be our context data
  // Include any methods you want to make available to children
  const value = {
    DisplaySnapshot,
    setDisplaySnapshot, // Allow children to update the DisplaySnapshot
  };

  return (
    <DisplaySnapshotContext.Provider value={[DisplaySnapshot, setDisplaySnapshot]}>
      {children}
    </DisplaySnapshotContext.Provider>
  );
};

// Custom hook that components can use to access the context value
export const useDisplaySnapshot = () => {
  const context = useContext(DisplaySnapshotContext);
  if (context === undefined) {
    throw new Error('useDisplaySnapshot must be used within a DisplaySnapshotProvider');
  }
  return context;
};
