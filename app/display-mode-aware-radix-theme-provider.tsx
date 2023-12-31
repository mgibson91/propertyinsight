'use client'

import React, { createContext, useState, useContext } from 'react';
import { OhlcData, SeriesMarker, Time } from "lightweight-charts";
import { UserSeriesData } from "@/app/client-page";
import { Theme } from "@radix-ui/themes";

export interface Mode {
  mode: "light" | "dark";
}

// Create a context with a default empty value
const DisplayModeContext = createContext<[Mode, React.Dispatch<React.SetStateAction<Mode>>]>([{ mode: "dark" }, () => { }]);

// Create a provider component
export const DisplayModeAwareRadixThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [displayMode, setDisplayMode] = useState<Mode>({
    mode: "dark",
  }); // Initialize with null or any default value

  // The value prop of the provider will be our context data
  // Include any methods you want to make available to children
  const value = {
    displayMode,
    setDisplayMode, // Allow children to update the displayMode
  };

  return (
    <DisplayModeContext.Provider value={[displayMode, setDisplayMode]}>
      <Theme
        accentColor="cyan"
        grayColor="slate"
        radius="large"
        appearance={displayMode.mode}
        scaling="100%"
        className={"h-full flex flex-col bg-primary-base"}
      >
        {children}
      </Theme>
    </DisplayModeContext.Provider>
  );
};

// Custom hook that components can use to access the context value
export const useDisplayMode = () => {
  const context = useContext(DisplayModeContext);
  if (context === undefined) {
    throw new Error('useDisplayMode must be used within a DisplayModeProvider');
  }
  return context;
};

