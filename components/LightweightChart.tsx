'ues client';

// src/components/LightweightChart.jsx
import { CandlestickData, createChart, IChartApi, LineData, SeriesMarker, Time } from 'lightweight-charts';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export const LightweightChart = ({
  candlestickData,
  userSeriesData,
  indicatorData,
  seriesMarkers,
  futureValues,
  visibleRange,
  color,
}: {
  candlestickData: CandlestickData<Time>[];
  userSeriesData: {
    overlay: boolean;
    color: string;
    lineWidth: 1 | 2 | 3 | 4;
    data: LineData<Time>[];
  }[];
  indicatorData: {
    overlay: boolean;
    color: string;
    lineWidth: 1 | 2 | 3 | 4;
    data: LineData<Time>[];
  }[];
  seriesMarkers: SeriesMarker<Time>[];
  // Test
  updateIntervalMs?: number;
  futureValues?: number;
  visibleRange?: number;
  color?: {
    background?: string;
    gridLines?: string;
    text?: string;
    scale?: string;
  };
}) => {
  let chart: IChartApi;
  //
  // useImperativeHandle(ref, () => ({
  //   resize() {
  //     // Method to be called from the parent component
  //     console.log('Method called from child component');
  //     chart.timeScale().fitContent();
  //   },
  // }));

  const chartContainerRef = useRef<HTMLDivElement>(null);

  let resizeObserver;

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: {
          color: color?.background || '#111210',
        },
        // textColor: 'rgba(33, 56, 77, 1)',
        textColor: color?.text || '#F6FEF4B0',
      },
      grid: {
        vertLines: {
          color: color?.gridLines || '#F2FCED3B',
        },
        horzLines: {
          color: color?.gridLines || '#F2FCED3B',
        },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: color?.scale || '#EDFDEB57',
      },
      timeScale: {
        borderColor: color?.scale || '#EDFDEB57',
        timeVisible: true,
      },

      leftPriceScale: {
        visible: true,
      },
    });

    // Fit content to the chart's time scale
    chart.timeScale().fitContent();

    if (futureValues) {
      chart.timeScale().scrollToPosition(10, false);
    }
    // if (visibleRange) {
    //   chart.timeScale().setVisibleLogicalRange({ from: candlestickData.length - visibleRange, to: candlestickData.length })
    // }

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
          lastValueVisible: false,
          // priceScaleId: 'left',
        });

        lineSeries.setData(series.data);
      } else {
        // Plot in extra chart
      }
    }

    for (const series of indicatorData) {
      if (!series.data?.length) {
        continue;
      }

      if (series.overlay) {
        const lineSeries = chart.addLineSeries({
          color: series.color,
          lineWidth: series.lineWidth || 1,
          lastValueVisible: false,
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

    // Make Chart Responsive with screen resize
    resizeObserver = new ResizeObserver(entries => {
      console.log('resize', entries);
      if (entries.length === 0 || entries[0].target !== chartContainerRef.current) {
        return;
      }
      const newRect = entries[0].contentRect;
      chart.applyOptions({ height: newRect.height, width: newRect.width });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      if (chart) {
        chart.remove();
      }

      resizeObserver.disconnect();
    };
  }, [candlestickData, userSeriesData, seriesMarkers]);

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
  );
};
