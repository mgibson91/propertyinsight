// src/components/LightweightChart.jsx
import {
  CandlestickData,
  createChart,
  LineData,
  SeriesMarker,
  Time,
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';

export const LightweightChartRealtime = ({
  candlestickData,
  userSeriesData,
  seriesMarkers,

  getNext,

  // Test
  rightCandleOffset,
  updateIntervalMs,
}: {
  candlestickData: CandlestickData<Time>[];
  userSeriesData: {
    overlay: boolean;
    color: string;
    lineWidth: number;
    data: LineData<Time>[];
  }[];
  seriesMarkers: SeriesMarker<Time>[];

  getNext: () => {
    candlestickData: CandlestickData<Time>;
    userSeriesData: {
      overlay: boolean;
      color: string;
      lineWidth: number;
      data: LineData<Time>;
    }[];
    seriesMarkers: SeriesMarker<Time>;
  }

  rightCandleOffset?: number;
  updateIntervalMs: number;
}) => {
  const chartContainerRef = useRef();
  const intervalRef = useRef();

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: {
          color: '#111210',
        },
        // textColor: 'rgba(33, 56, 77, 1)',
        textColor: '#F6FEF4B0',
      },
      grid: {
        vertLines: {
          color: '#F2FCED3B',
        },
        horzLines: {
          color: '#F2FCED3B',
        },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#EDFDEB57',
      },
      timeScale: {
        borderColor: '#EDFDEB57',
      },

      leftPriceScale: {
        visible: true,
      },
    });

    // Fit content to the chart's time scale
    chart.timeScale().fitContent();

    // chart.timeScale().setVisibleLogicalRange({ from: 0, to: 200 });
    chart.timeScale().scrollToPosition(20, false);

    // Create the candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: 'rgba(38, 166, 154, 1)',
      downColor: 'rgba(255, 82, 82, 1)',
      borderVisible: false,
      wickUpColor: 'rgba(38, 166, 154, 1)',
      wickDownColor: 'rgba(255, 82, 82, 1)',
    });

    // Set the data for the candlestick series
    candlestickSeries.setData(candlestickData);
    candlestickSeries.setMarkers(seriesMarkers);

    for (const series of userSeriesData) {
      if (!series.data?.length) {
        continue;
      }

      if (series.overlay) {
        const lineSeries = chart.addLineSeries({
          color: series.color,
          lineWidth: series.lineWidth || 1,
          // priceScaleId: 'left',
        });

        lineSeries.setData(series.data);
      } else {
        // Plot in extra chart
      }
    }

    // function updateChartRecursively() {
    //   // Base condition to stop the recursion
    //   if (!futureValuesRemaining) {
    //     return; // Stop if no more values to process or some other stopping condition
    //   }
    //
    //   // Continue with the update logic
    //   setTimeout(() => {
    //     // Update the cached value
    //     setFutureValuesRemaining(futureValuesRemaining - 1);
    //
    //     // Update the chart position
    //     const position = chart.timeScale().scrollPosition();
    //     chart.timeScale().scrollToPosition(position + 1, true);
    //
    //     // Update all series (you might need additional logic here depending on what "update all series" entails)
    //
    //     // Recursively call updateChartRecursively() to continue the process
    //     updateChartRecursively();
    //   }, updateIntervalMs);
    // }

    // Initially call the function
    //     updateChartRecursively();

    // lineSeries.priceScale().applyOptions({
    //   // set the positioning of the volume series
    //   scaleMargins: {
    //     top: 0.75, // highest point of the series will be 70% away from the top
    //     bottom: 0.05,
    //   },
    // });

    // candlestickSeries.priceScale().applyOptions({
    //   // set the positioning of the volume series
    //   scaleMargins: {
    //     top: 0.05, // highest point of the series will be 70% away from the top
    //     bottom: 0.3,
    //   },
    // });

    intervalRef.current = setInterval(() => {
      if (!getNext) {
        clearInterval(intervalRef.current)
        return;
      }

      const { candlestickData, userSeriesData, seriesMarkers } = getNext();

      candlestickSeries.update(candlestickData);
      // candlestickSeries.setMarkers(seriesMarkers);

      // Will need some series map for updates
      // for (const series of userSeriesData) {
      //   if (!series.data?.length) {
      //     continue;
      //   }
      //
      //   if (series.overlay) {
      //     const lineSeries = chart.addLineSeries({
      //       color: series.color,
      //       lineWidth: series.lineWidth || 1,
      //       // priceScaleId: 'left',
      //     });
      //
      //     lineSeries.setData(series.data);
      //   } else {
      //     // Plot in extra chart
      //   }
      // }
    });



    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      clearInterval(intervalRef.current);
    };
  }, [candlestickData, userSeriesData, seriesMarkers]);

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  );
};
