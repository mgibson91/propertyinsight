import { useEffect, useRef, useState } from 'react';
import { LightweightChart } from './LightweightChart';
import { CandlestickData, LineData, SeriesMarker, Time } from 'lightweight-charts';
import { DisplaySnapshot } from '@/logic/snapshots/build-display-snapshot';

export function BacktestChart({
  autoplay = false,
  candlesPerSecond = 1,
  displaySnapshot,
  futureValueCount,
  minDatapointsRequiredForAllSeries,
  color,
}: {
  autoplay: boolean;
  candlesPerSecond?: number;
  displaySnapshot: DisplaySnapshot;
  futureValueCount: number;
  updateIntervalMs?: number;
  minDatapointsRequiredForAllSeries: number;
  color?: {
    background?: string;
    gridLines?: string;
    text?: string;
    scale?: string;
  };
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
        console.log('Interval running', positionRef.current, displaySnapshot.candlestickData.length - 1);
        if (positionRef.current >= displaySnapshot.candlestickData.length - 1) {
          clearExistingInterval();
        } else {
          // Update position using the ref's current value
          const newPosition = positionRef.current + 1;
          if (newPosition < displaySnapshot.candlestickData.length - 1) {
            positionRef.current = newPosition;
          } else {
            // Clear interval if the futureValueCount is reached
            clearExistingInterval();
          }

          // Trigger a re-render by updating the renderKey
          setRenderKey(prevKey => prevKey + 1);
        }
      }, actualUpdateIntervalMs) as any;
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
    setRenderKey(0);
  }, [displaySnapshot]);

  const candlestickChartData = displaySnapshot.candlestickData.slice(
    0,
    Math.min(displaySnapshot.triggerOffset, minDatapointsRequiredForAllSeries) + positionRef.current + 1
  );

  const latestTime = candlestickChartData[candlestickChartData.length - 1].time;

  const userSeriesChartData = displaySnapshot.userSeriesData.map(series => {
    const latestIndex = series.data.findIndex(data => data.time === latestTime);
    const data = series.data.slice(0, latestIndex + 1);
    return {
      ...series,
      data,
    };
  });

  return (
    <LightweightChart
      key={renderKey} // Use the key to trigger re-renders when needed
      visibleRange={200}
      futureValues={100}
      indicatorData={[]}
      userSeriesData={userSeriesChartData}
      candlestickData={candlestickChartData}
      // seriesMarkers={[conditionMarker, ...(outcome?.outcomeDetails && positionRef.current >= outcome.outcomeDetails.offset ? [outcome.marker] : [])]}
      seriesMarkers={[
        displaySnapshot.conditionMarker,
        // outcomeMarker,
        // outcome.marker,
        // ...(outcome?.outcomeDetails && positionRef.current >= outcome.outcomeDetails.offset ? [outcome.marker] : []),
        ...(positionRef.current >= displaySnapshot.outcomeOffset - 1 ? [displaySnapshot.outcomeMarker] : []),
      ]}
      // seriesMarkers={[conditionMarker, ...(outcome?.outcomeDetails ? [outcome.marker] : [])]}
      color={color}
    />
  );
}
