'use client'

import React, { createContext, useState, useContext } from 'react';
import { OhlcData, SeriesMarker, Time, UTCTimestamp } from "lightweight-charts";
import { UserSeriesData } from "@/app/client-page";

export interface MatchingSnapshot {
  marker: SeriesMarker<UTCTimestamp>;
  candlestickData: OhlcData<UTCTimestamp>[];
  userSeriesData: UserSeriesData[];
  outcome?: {
    marker: SeriesMarker<Time>;
    outcomeDetails: {
      offset: number;
      value: number;
      text: string;
    };
  };
  historicalCandles: number;
}

// Create a context with a default empty value
const MatchingSnapshotContext = createContext<[MatchingSnapshot[], React.Dispatch<React.SetStateAction<MatchingSnapshot[]>>]>([[], () => {}]);

// Create a provider component
export const MatchingSnapshotProvider = ({ children }: { children: React.ReactNode }) => {
  const [matchingSnapshot, setMatchingSnapshot] = useState<MatchingSnapshot[]>([]); // Initialize with null or any default value

  // The value prop of the provider will be our context data
  // Include any methods you want to make available to children
  const value = {
    matchingSnapshot,
    setMatchingSnapshot, // Allow children to update the matchingSnapshot
  };

  return (
    <MatchingSnapshotContext.Provider value={[matchingSnapshot, setMatchingSnapshot]}>
      {children}
    </MatchingSnapshotContext.Provider>
  );
};

// Custom hook that components can use to access the context value
export const useMatchingSnapshot = () => {
  const context = useContext(MatchingSnapshotContext);
  if (context === undefined) {
    throw new Error('useMatchingSnapshot must be used within a MatchingSnapshotProvider');
  }
  return context;
};

