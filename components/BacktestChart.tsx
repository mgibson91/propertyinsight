import { useEffect, useRef, useState } from 'react';
import { LightweightChart } from './LightweightChart';
import {
  CandlestickData,
  LineData,
  SeriesMarker,
  Time,
} from 'lightweight-charts';

export function BacktestChart({
  autoplay = false,
  candlesPerSecond = 1,
  candlestickData,
  userSeriesData,
  conditionMarker,
  outcome,
  futureValueCount,
  minDatapointsRequiredForAllSeries,
  color,
}: {
  autoplay: boolean;
  candlesPerSecond?: number;
  candlestickData: CandlestickData<Time>[];
  userSeriesData: {
    overlay: boolean;
    color: string;
    lineWidth: number;
    data: LineData<Time>[];
  }[];
  conditionMarker: SeriesMarker<Time>;
  outcome?: {
    outcomeDetails: {
      offset: number;
      value: number;
      text: string;
    };
    marker: SeriesMarker<Time>;
  }
  futureValueCount: number;
  updateIntervalMs?: number;
  minDatapointsRequiredForAllSeries: number;
  color?: {
    background?: string;
  }
}) {
  const intervalRef = useRef<number>();
  const positionRef = useRef<number>(0); // Create a ref for position
  const [renderKey, setRenderKey] = useState<number>(0); // Key to trigger re-renders

  const clearExistingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    clearExistingInterval();

    const actualUpdateIntervalMs = 1000 / candlesPerSecond;

    if (autoplay) {
      // Setup the interval
      intervalRef.current = setInterval(() => {
        console.log('Interval running', positionRef.current, futureValueCount);
        if (positionRef.current >= futureValueCount) {
          clearExistingInterval();
        } else {
          // Update position using the ref's current value
          const newPosition = positionRef.current + 1;
          if (newPosition < futureValueCount) {
            positionRef.current = newPosition;
          } else {
            // Clear interval if the futureValueCount is reached
            clearExistingInterval();
          }

          // Trigger a re-render by updating the renderKey
          setRenderKey((prevKey) => prevKey + 1);
        }
      }, actualUpdateIntervalMs);
    }

    // Clear the interval when the component unmounts or dependencies change
    return () => {
      clearExistingInterval();
    };
  }, [autoplay, futureValueCount, candlesPerSecond]);

  useEffect(() => {
    // clearExistingInterval();

    // You can update positionRef.current as needed
    // For example: positionRef.current = 0;
    positionRef.current = 0;
    setRenderKey(0)
  }, [candlestickData, userSeriesData, conditionMarker]);

  return (
    <LightweightChart
      key={renderKey} // Use the key to trigger re-renders when needed
      visibleRange={200}
      futureValues={100}
      userSeriesData={userSeriesData.map((series) => ({
        ...series,
        data: series.data.slice(
          0,
          minDatapointsRequiredForAllSeries + positionRef.current
        ),
      }))}
      candlestickData={candlestickData.slice(
        0,
        minDatapointsRequiredForAllSeries + positionRef.current
      )}
      // seriesMarkers={[conditionMarker, ...(outcome?.outcomeDetails && positionRef.current >= outcome.outcomeDetails.offset ? [outcome.marker] : [])]}
      seriesMarkers={[conditionMarker, ...(outcome?.outcomeDetails && positionRef.current >= outcome.outcomeDetails.offset ? [outcome.marker] : [])]}
      // seriesMarkers={[conditionMarker, ...(outcome?.outcomeDetails ? [outcome.marker] : [])]}
      color={color}
    />
  );
}
