'use client';

import { useEffect, useState } from 'react';
import { CandlestickData, LineData, OhlcData, SeriesMarker, UTCTimestamp } from 'lightweight-charts';
import { fetchCandlesFromMemory } from '@/requests/get-bitcoin-prices';
import { calculateTriggers } from '@/logic/calculate-triggers';
import TimeFrameSelector from '@/components/TimeFrameSelector';
import { calculateOutcomes } from '@/logic/calculate-outcomes';
import { Button, Card, Checkbox, Code, Heading, IconButton, TextFieldInput } from '@radix-ui/themes';
import TickerSelector from '@/components/TickerSelector';
import { CodeIcon, CopyIcon, EyeNoneIcon, EyeOpenIcon, Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { LightweightChart } from '@/components/LightweightChart';
import { UserSeriesDialog } from '@/components/UserSeriesDialog';
import { UserTriggerDialog } from '@/components/UserTriggerDialog';
import { UserOutcomeDialog } from '@/components/UserOutcomeDialog';
import { useMatchingSnapshot } from '@/app/matching-snapshot-provider';
import { useDisplayMode } from '@/app/display-mode-aware-radix-theme-provider';
import { getConsolidatedSeries } from '@/app/(logic)/get-consolidated-series';
import { UserOutcome, UserSeries, UserSeriesData, UserTrigger } from '@/app/(logic)/types';
import { Indicator } from '@/logic/indicators/types';
import { EditIndicatorDialog } from '@/components/edit-indicator-dialog';
import { PRESET_INDICATOR_SMA } from '@/logic/indicators/preset-indicator';
import { AddIndicatorDialog } from '@/components/add-indicator-dialog';
import SlideToggle2 from '@/shared/layout/slide-toggle2';
import { Toast } from '@/shared/toast';
import { EditIndicatorCodeDialog } from '@/components/edit-indicator-code-dialog';

// import 'codemirror/keymap/sublime';
// import 'codemirror/theme/monokai.css';
// Manually loading the language resources here
// import 'codemirror/mode/javascript/javascript';

const INITIAL_USER_SERIES: UserSeries[] = [
  // {
  //   name: 'sma20',
  //   // seriesFunctionString: `
  //   // return data.map(d => ({ time: d.time, value: d.close }));
  //   // `,
  //   seriesFunctionString: `const windowSize = 20;  // Setting the period for SMA
  //
  // const smaData = data.map((current, index) => {
  //   if (index >= windowSize - 1) {
  //     // Calculate SMA only when there are enough preceding data points
  //     let sum = 0;
  //     // Sum the closing prices of the last 'windowSize' days
  //     for (let i = index - windowSize + 1; i <= index; i++) {
  //       sum += data[i].close;
  //     }
  //     let average = sum / windowSize;
  //     return { time: current.time, value: average };
  //   } else {
  //     return null;  // Not enough data to calculate SMA
  //   }
  // });
  //
  // // Filter out the null entries, similar to your offset example
  // return smaData.filter(item => item !== null);`,
  //   overlay: true,
  //   color: '#E54D2E',
  //   lineWidth: 1,
  // },
  // {
  //   name: 'sma50',
  //   // seriesFunctionString: `
  //   // return data.map(d => ({ time: d.time, value: d.close }));
  //   // `,
  //   seriesFunctionString: `const windowSize = 50;  // Setting the period for SMA
  //
  // const smaData = data.map((current, index) => {
  //   if (index >= windowSize - 1) {
  //     // Calculate SMA only when there are enough preceding data points
  //     let sum = 0;
  //     // Sum the closing prices of the last 'windowSize' days
  //     for (let i = index - windowSize + 1; i <= index; i++) {
  //       sum += data[i].close;
  //     }
  //     let average = sum / windowSize;
  //     return { time: current.time, value: average };
  //   } else {
  //     return null;  // Not enough data to calculate SMA
  //   }
  // });
  //
  // // Filter out the null entries, similar to your offset example
  // return smaData.filter(item => item !== null);`,
  //   overlay: true,
  //   color: '#29A383',
  //   lineWidth: 1,
  // },
];

/**
 * return (
 *     data[0].close > data[0].sma &&
 *     data[1].close <= data[1].sma &&
 *     data[2].close < data[2].sma
 *   );
 */

const INITIAL_USER_TRIGGERS: UserTrigger[] = [
  // {
  //   tag: '1',
  //   name: 'sma crossover',
  //   triggerFunctionString: `return data[0].sma20 > data[0].sma50 && data[1].sma20 < data[1].sma50`,
  //   size: 2,
  //   color: '#ffffff',
  // },
];

// const INITIAL_USER_OUTCOME: UserOutcome = {
//   tag: '1',
//   name: '2% either way',
//   outcomeFunctionString: `if (data[0].high > trigger.value * 1.02) {
//     return 'success';
//   } else if (data[0].low < trigger.value * 0.98) {
//     return 'failure';
//   }
//
//   return 'uncertain';`,
//   color: '',
//   size: 1,
// };

function convertStreamsToChartSeries(
  streamDataMap: Record<string, LineData<UTCTimestamp>[]>,
  indicators: Indicator[]
): {
  overlay: boolean;
  data: LineData<UTCTimestamp>[];
  color: string;
  lineWidth: 1 | 2 | 3 | 4;
}[] {
  console.log('AAAAA');
  return Object.keys(streamDataMap || {}).map(key => {
    const indicator = indicators.find(indicator =>
      indicator.streams.find(stream => `${indicator.tag}.${stream.tag}` === key)
    );

    if (!indicator) {
      return {
        overlay: true, // Default to true if no indicator is found
        data: streamDataMap[key],
        color: 'red', // Default color
        lineWidth: 1, // Default line width
      };
    }

    // Assuming each indicator has multiple streams for different streams
    const streamStyle = indicator.streams.find(stream => `${indicator.tag}.${stream.tag}` === key);

    return {
      overlay: streamStyle?.overlay ?? true, // Use overlay from streamStyle if available, else default to true
      data: streamDataMap[key],
      color: streamStyle?.color ?? 'red', // Use color from streamStyle if available, else default to red
      lineWidth: streamStyle?.lineWidth ?? 1, // Use lineWidth from streamStyle if available, else default to 1
    };
  });
}

const App = () => {
  const [ticker, setTicker] = useState('BTCUSD');
  const [timeframe, setTimeframe] = useState('1h');
  const [startDate, setStartDate] = useState(
    // new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
    new Date('2023-11-15')
  );
  const [endDate, setEndDate] = useState(new Date('2023-12-15'));
  const [candlestickData, setCandlestickData] = useState<CandlestickData<UTCTimestamp>[]>([]);
  const [userSeriesData, setUserSeriesData] = useState<
    {
      overlay: boolean;
      data: LineData<UTCTimestamp>[];
      color: string;
      lineWidth: 1 | 2 | 3 | 4;
    }[]
  >([]);
  const [userIndicatorData, setUserIndicatorData] = useState<
    {
      overlay: boolean;
      data: LineData<UTCTimestamp>[];
      color: string;
      lineWidth: 1 | 2 | 3 | 4;
    }[]
  >([]);
  // Record for easy build and mapping of tag : data
  const [indicatorSeriesMap, setIndicatorSeriesMap] = useState<Record<string, LineData<UTCTimestamp>[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSeries, setUserSeries] = useState<UserSeries[]>([]);
  const [userIndicators, setUserIndicators] = useState<Array<Indicator>>([PRESET_INDICATOR_SMA]);
  const [userTriggers, setUserTriggers] = useState<UserTrigger[]>([]);
  const [userOutcome, setUserOutcome] = useState<UserOutcome | null>(null);
  const [triggerMarkers, setTriggerMarkers] = useState<SeriesMarker<UTCTimestamp>[]>([]);
  const [outcomeMarkers, setOutcomeMarkers] = useState<SeriesMarker<UTCTimestamp>[]>([]);

  const [markerSnapshots, setMarkerSnapshots] = useMatchingSnapshot();

  const [displayMode] = useDisplayMode();

  // const [markerSnapshots, setMarkerSnapshots] = useState<
  //   {
  //     marker: SeriesMarker<UTCTimestamp>;
  //     candlestickData: OhlcData<UTCTimestamp>[];
  //     userSeriesData: UserSeriesData[];
  //     outcome?: {
  //       marker: SeriesMarker<UTCTimestamp>;
  //       outcomeDetails: {
  //         offset: number;
  //         value: number;
  //         text: string;
  //       };
  //     };
  //     historicalCandles: number;
  //   }[]
  // >([]);
  const [currentMarkerSnapshotIndex, setCurrentMarkerSnapshotIndex] = useState<number>(0);
  const [outcomeSummary, setOutcomeSummary] = useState<{
    successCount: number;
    failCount: number;
    winPerc: number;
  } | null>(null);

  const [currentIndicator, setCurrentIndicator] = useState<Indicator>(DEFAULT_INDICATOR);
  const [currentSeries, setCurrentSeries] = useState<UserSeries>(DEFAULT_USER_SERIES);
  const [currentTrigger, setCurrentTrigger] = useState<UserTrigger>({
    id: '',
    name: '',
    triggerFunctionString: '',
    color: '',
    size: 0,
  });
  const [currentOutcome, setCurrentOutcome] = useState<UserOutcome>({
    id: '',
    name: '',
    outcomeFunctionString: '',
    color: '',
    size: 0,
  });
  const [showDialog, setShowDialog] = useState(false);
  const [showAddIndicatorDialog, setShowAddIndicatorDialog] = useState(false);
  const [showEditIndicatorDialog, setShowEditIndicatorDialog] = useState(false);
  const [showEditIndicatorCodeDialog, setShowEditIndicatorCodeDialog] = useState(false);
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);
  const [showOutcomeDialog, setShowOutcomeDialog] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [candlesPerSecond, setCandlesPerSecond] = useState<number>(1);

  // Gets the indicator stream data and it's style config
  function getIndicatorChartData(tag: string): LineData<UTCTimestamp>[] {
    const indicatorStream = indicatorSeriesMap[tag];

    if (!indicatorStream) {
      return [];
    }

    return indicatorStream;
  }

  useEffect(() => {
    const newIndicatorData = convertStreamsToChartSeries(indicatorSeriesMap, userIndicators);
    setUserIndicatorData(newIndicatorData);
  }, [indicatorSeriesMap, userIndicators]);

  useEffect(() => {
    setUserSeries(INITIAL_USER_SERIES);
    setUserTriggers(INITIAL_USER_TRIGGERS);
    // setUserOutcome(INITIAL_USER_OUTCOME);
  }, []);

  useEffect(() => {
    handleFetchClick();
  }, [ticker, timeframe, startDate, endDate, userSeries, userTriggers, userOutcome, userIndicators]);

  // // Change the user data on change of config
  // useEffect(() => {
  //   const newIndicatorData: Record<string, LineData<UTCTimestamp>[]> = {};
  //   // Update indicator data
  //   const newIndicatorData = userIndicators.map(indicator => {
  //     return {
  //       tag: indicator.tag,
  //       data: getIndicatorChartData(indicator.tag),
  //       overlay: indicator.overlay,
  //       streams: indicator.streams,
  //     };
  //   });
  //
  //   // Update indicator data
  //   setIndicatorSeriesMap(newIndicatorData);
  // }, [userIndicators]);

  const handleFetchClick = async () => {
    setLoading(true);
    setError(null);
    try {
      // // Fetch candlestick data from the API
      // const rawData = await fetchCandles(
      //   ticker,
      //   timeframe,
      //   startDate.getTime(),
      //   endDate.getTime()
      // );

      const rawData = await fetchCandlesFromMemory(ticker, timeframe, startDate.getTime(), endDate.getTime());

      // Map the raw data to the format expected by the LightweightChart
      const formattedCandles = rawData.map(
        candle =>
          ({
            time: candle.timestamp / 1000, // Convert timestamp to seconds
            // time: candle.timestamp, // Convert timestamp to seconds
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          }) as OhlcData<UTCTimestamp>
      );

      function prependAccessorFunctions(funcString: string): string {
        const adjustedFunc = `
const _open = index => data[index].open;
const _high = index => data[index].high;
const _low = index => data[index].low;
const _close = index => data[index].close;

//--- USER DEFINED ---
${funcString}`;

        return adjustedFunc;
      }

      // Calculate indicators
      const newUserSeriesData = userSeries.map(series => {
        const func = new Function(
          'data',
          // 'period',
          // series.seriesFunctionString
          prependAccessorFunctions(series.seriesFunctionString)
        );

        const seriesData = func(formattedCandles);
        return {
          name: series.name,
          overlay: series.overlay,
          data: seriesData,
          color: series.color,
          lineWidth: series.lineWidth,
        };
      });

      setUserSeriesData(newUserSeriesData);
      setCandlestickData(formattedCandles);

      // 1. The consolidated input series
      const { consolidatedSeries, indicatorStreams } = getConsolidatedSeries(
        formattedCandles,
        newUserSeriesData,
        userIndicators
      );

      const indicatorSeriesMap: Record<string, LineData<UTCTimestamp>[]> = {};

      for (const stream of indicatorStreams) {
        indicatorSeriesMap[`${stream.indicatorTag}.${stream.tag}`] = stream.data;
      }

      setIndicatorSeriesMap(indicatorSeriesMap);

      /**
       * Get Consolidated series
       * Instantiate user marker trigger function
       * It rate through consolidated series array
       * At each point, Iterate through trigger functions
       * If trigger function returns true, add marker to array
       */

      const markerFunctionMap = new Map<
        string,
        {
          lookback: number;
          func: Function; // (data: ConsolidatedLineData[]) => boolean;
        }
      >();

      for (const trigger of userTriggers) {
        markerFunctionMap.set(trigger.name, {
          // TODO: Consider this - should in theory be the min required but hardcoded for display ease
          // lookback: HISTORICAL_VALUE_COUNT,
          lookback: 50,
          func: new Function('data', trigger.triggerFunctionString),
        });
      }
      /*
         return (
              data[0].close > data[0].sma &&
              data[1].close <= data[1].sma &&
              data[2].close < data[2].sma
            );
         */

      // // Set manually for now
      // markerFunctionMap.set('close above ma', {
      //   lookback: 20,
      //   // func: (data: ConsolidatedLineData[]) => {
      //   //   return (
      //   //     data[0].close > data[0].sma &&
      //   //     data[1].close <= data[1].sma &&
      //   //     data[2].close < data[2].sma
      //   //   );
      //   // },
      //   func: new Function(
      //     'data',
      //     series.seriesFunctionString
      //   );
      // });
      //

      // const triggerMarkerSeries: {
      //   name: string;
      //   data: SeriesMarker<UTCTimestamp>[];
      // }[] = [
      //   {
      //     name: 'close above ma',
      //     data: [
      //       {
      //         time: formattedCandles[40].time,
      //         position: 'belowBar',
      //         color: '#D1FE77E4',
      //         shape: 'arrowUp',
      //         size: 3,
      //       },
      //     ],
      //   },
      // ];

      // 2. matchingMarkers is ready to go
      const { matchingMarkers, conditionMarkers } = calculateTriggers(
        markerFunctionMap,
        consolidatedSeries,
        newUserSeriesData,
        displayMode.mode === 'dark'
      );

      let calculatedOutcomeMarkers: {
        marker: SeriesMarker<UTCTimestamp>;
        outcome: { time: number; offset: number; value: number };
      }[] = [];

      if (userOutcome) {
        const outcomeUserFunc = new Function('data', 'trigger', userOutcome.outcomeFunctionString);

        // 3. calculate outcomes
        const { outcomes, summary } = calculateOutcomes({
          consolidatedSeries,
          triggers: conditionMarkers.map(condition => {
            // triggers: [conditionMarkers[0]].map((condition) => {
            return {
              time: condition.marker.time as number,
              offset: consolidatedSeries.findIndex(c => c.time === condition.marker.time),
              text: condition.marker.text || '?',
            };
          }),
          outcomeFunc: outcomeUserFunc,
          // outcomeFunc: (
          //   data: ConsolidatedLineData[],
          //   trigger: { value: number }
          // ) => {
          //   if (data[0].high > trigger.value * 1.02) {
          //     return 'success';
          //   } else if (data[0].low < trigger.value * 0.98) {
          //     return 'failure';
          //   }
          //
          //   return 'uncertain';
          // },
        });

        // Convert outcomes to markers
        calculatedOutcomeMarkers = outcomes.map(outcome => {
          return {
            marker: {
              time: outcome.outcome.time,
              position: outcome.type === 'success' ? 'belowBar' : 'aboveBar', // 'inBar',
              color:
                outcome.type === 'success'
                  ? displayMode.mode === 'dark'
                    ? '#1FD8A4'
                    : '#208368'
                  : displayMode.mode === 'dark'
                    ? '#FF977D'
                    : '#D13415',
              shape: outcome.type === 'success' ? 'arrowUp' : 'arrowDown',
              size: 2,
              text: outcome.text,
            } as SeriesMarker<UTCTimestamp>,
            outcome: outcome.outcome,
          };
        });

        setOutcomeMarkers(calculatedOutcomeMarkers.map(outcome => outcome.marker));
        setOutcomeSummary({
          failCount: summary.failCount,
          successCount: summary.successCount,
          winPerc: (summary.successCount / (summary.successCount + summary.failCount)) * 100,
        });
      }

      setTriggerMarkers(matchingMarkers);
      setMarkerSnapshots(
        conditionMarkers.map(marker => {
          const result: {
            marker: SeriesMarker<UTCTimestamp>;
            candlestickData: OhlcData<UTCTimestamp>[];
            userSeriesData: UserSeriesData[];
            outcome?: {
              outcomeDetails: {
                offset: number;
                value: number;
                text: string;
              };
              marker: SeriesMarker<UTCTimestamp>;
            };
            historicalCandles: number;
          } = marker;

          const outcome = calculatedOutcomeMarkers.find(outcome => outcome.marker.text === marker.marker.text);
          if (outcome) {
            result.outcome = {
              outcomeDetails: {
                offset: outcome.outcome.offset,
                value: outcome.outcome.value,
                text: outcome.marker.text || 'N/A',
              },
              marker: outcome.marker,
            };
          }

          return result;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleIndicatorOverlay = (indicatorTag: string) => {
    const index = userIndicators.findIndex(i => i.tag === indicatorTag);
    const newIndicators = [...userIndicators];
    const newOverlay = !newIndicators[index].overlay;
    newIndicators[index].overlay = newOverlay;
    newIndicators[index].streams = newIndicators[index].streams.map(style => {
      return { ...style, overlay: newOverlay };
    });

    // // TODO: Better sync between config and data!!!!
    setUserIndicators(newIndicators);
    //
    // // Update indicatorData
    // const newIndicatorData = indicatorSeriesMap.map(indicator => {
    //   if (indicator.id === indicatorId) {
    //     indicator.overlay = newOverlay;
    //   }
    //   return indicator;
    // });
    // setIndicatorSeriesMap(newIndicatorData);
  };

  // const handleKeyDown = (event: React.KeyboardEvent) => {
  //   console.log('KEYDOWN', event.key);
  //   if (event.key === 'i') {
  //     event.preventDefault();
  //     setShowAddIndicatorDialog(true);
  //   }
  // };

  useEffect(() => {
    const handleKeyDown = event => {
      console.log('KEYDOWN', event.key);
      if ((event.key === 'i' && event.ctrlKey) || (event.key === 'i' && event.metaKey)) {
        event.preventDefault();
        setShowAddIndicatorDialog(true);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setShowAddIndicatorDialog(false);
      }
    };

    // Bind keydown event to window
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <>
      <div className={'flex flex-col w-[100vw] items-start'}>
        <div className={'flex flex-row gap-2 m-5 w-full pr-10'}>
          <Card className={''}>
            <div className={'flex flex-row items-center gap-3'}>
              <div className={'flex flex-col'}>
                <label>Ticker</label>
                <TickerSelector
                  options={[
                    // { value: 'FETUSD', label: 'FET/USD' },
                    { value: 'BTCUSD', label: 'BTC/USD' },
                    // { value: 'ETHUSD', label: 'ETH/USD' },
                  ]}
                  value={ticker}
                  onChange={selectedOption => setTicker(selectedOption)}
                />
              </div>

              <div className={'flex flex-col'}>
                <label>Timeframe</label>
                <TimeFrameSelector
                  options={[
                    // { value: '15m', label: '15m' },
                    { value: '1h', label: '1h' },
                  ]}
                  value={timeframe}
                  onChange={selectedOption => setTimeframe(selectedOption)}
                />
              </div>
            </div>
          </Card>

          <Card className={''}>
            <div className={'flex flex-row items-center gap-3'}>
              <div className={'flex flex-col'}>
                <label>Start Time</label>
                {/*<DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} />*/}
                {/*Change to use normal html input date*/}
                <TextFieldInput
                  type="date"
                  value={startDate.toISOString().split('T')[0]} // Format the date to 'YYYY-MM-DD'
                  onChange={e => setStartDate(new Date(e.target.value))}
                />
              </div>

              <div className={'flex flex-col'}>
                <label>End Time</label>
                <TextFieldInput
                  type="date"
                  value={endDate.toISOString().split('T')[0]} // Format the date to 'YYYY-MM-DD'
                  onChange={e => setEndDate(new Date(e.target.value))}
                />
              </div>
            </div>
          </Card>

          <div className={'flex flex-col gap-2 justify-between'}>
            <Button onClick={handleFetchClick} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            {error && <div>Error fetching data: {error}</div>}
          </div>

          {outcomeSummary && (
            <Card className={'flex-0 ml-auto !bg-primary-bg-subtle'}>
              <div className={'flex flex-col'}>
                <div className={'flex flex-row'}>
                  <span className={'font-bold w-20'}>Wins:&nbsp;</span>
                  <span className={'text-[var(--jade-11)] font-bold'}>{outcomeSummary?.successCount}</span>
                </div>

                <div className={'flex flex-row'}>
                  <span className={'font-bold w-20'}>Losses:&nbsp;</span>
                  <span className={'text-[var(--tomato-11)] font-bold'}>{outcomeSummary?.failCount}</span>
                </div>

                <div className={'flex flex-row'}>
                  <span className={'font-bold w-20'}>Win Rate:&nbsp;</span>
                  <span className={'text-[var(--slate-11)] font-bold'}>
                    {isNaN(outcomeSummary?.winPerc) ? 0 : outcomeSummary?.winPerc.toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className={'flex flex-row w-[100%] flex-auto gap-5 p-5'}>
          <div className={'flex flex-col gap-5'}>
            <Card className={'!bg-primary-bg-subtle'}>
              <div className={'flex flex-col w-[300px] gap-3'}>
                <div className={'flex flex-row items-center justify-between'}>
                  <Heading size={'5'} className={'text-primary-text-contrast'}>
                    Indicators
                  </Heading>

                  <div className={'flex flex-row gap-2 items-start'}>
                    {/*<Button size={'1'} variant={'soft'}>*/}
                    {/*  My Library*/}
                    {/*</Button>*/}
                    <IconButton
                      size={'1'}
                      onClick={() => {
                        setShowAddIndicatorDialog(true);
                      }}
                    >
                      <PlusIcon />
                    </IconButton>

                    {/*<Sheet>*/}
                    {/*  <SheetTrigger>Open</SheetTrigger>*/}
                    {/*  <SheetContent>*/}
                    {/*    <SheetHeader>*/}
                    {/*      <SheetTitle>Are you absolutely sure?</SheetTitle>*/}
                    {/*      <SheetDescription>*/}
                    {/*        This action cannot be undone. This will permanently delete your account and remove your data*/}
                    {/*        from our servers.*/}
                    {/*      </SheetDescription>*/}
                    {/*    </SheetHeader>*/}
                    {/*  </SheetContent>*/}
                    {/*</Sheet>*/}
                  </div>
                </div>

                {userIndicators.map(indicator => (
                  <div key={indicator.tag} className={'flex flex-row items-center gap-3'}>
                    <div className={'flex flex-col flex-auto bg-primary-bg rounded-lg p-2'}>
                      <div className={'flex flex-row gap-5 justify-between'}>
                        <div className={'flex flex-col'}>
                          <div className={'flex flex-row items-center gap-2'}>
                            <label className={'font-bold text-sm truncate max-w-[150px]'}>{indicator.label}</label>
                          </div>

                          <SlideToggle2
                            heightClass="h-[100%]"
                            trigger={
                              <Code className={'!text-[10px] cursor-pointer hover:bg-accent-bg-active'}>
                                {indicator.tag}
                              </Code>
                            }
                          >
                            <div className={'flex flex-col gap-1 pt-1'}>
                              {indicator.streams.map((stream, i) => (
                                <Code className={'!text-[9px] cursor-pointer hover:bg-accent-bg-active'}>
                                  <Toast
                                    durationMs={1500}
                                    description={
                                      <div className={'flex flex-row items-center gap-2 text-primary-text text-sm'}>
                                        <Code size={'2'}>
                                          {indicator.tag}_${stream.tag}
                                        </Code>
                                        copied to clipboard
                                      </div>
                                    }
                                  >
                                    <div className={'flex flex-row items-center justify-between gap-2'}>
                                      {indicator.tag}_{stream.tag}
                                      <CopyIcon className={'h-3 w-3'} />
                                    </div>
                                  </Toast>
                                </Code>
                              ))}
                            </div>
                          </SlideToggle2>

                          {/*{indicator.streams.map((stream, i) => (*/}
                          {/*  <div className={'flex flex-row'}>*/}
                          {/*    <HoverCard.Root openDelay={300}>*/}
                          {/*      <HoverCard.Trigger>*/}
                          {/*        <Code*/}
                          {/*          className={'!text-[8px] cursor-pointer'}*/}
                          {/*          onClick={() => {*/}
                          {/*            navigator.clipboard.writeText(`${indicator.tag}.${stream.tag}`);*/}
                          {/*          }}*/}
                          {/*        >*/}
                          {/*          {stream.tag}*/}
                          {/*        </Code>*/}
                          {/*      </HoverCard.Trigger>*/}
                          {/*      <HoverCard.Content>*/}
                          {/*        Reference in code using{' '}*/}
                          {/*        <Code className={''}>*/}
                          {/*          {indicator.tag}.{stream.tag}*/}
                          {/*        </Code>*/}
                          {/*      </HoverCard.Content>*/}
                          {/*    </HoverCard.Root>*/}

                          {/*    {i === indicator.streams.length - 1 ? '' : '·'}*/}
                          {/*  </div>*/}
                          {/*))}*/}
                        </div>

                        <div className={'flex flex-row items-start gap-3'}>
                          <div className={'flex flex-row items-center gap-2'}>
                            <IconButton
                              variant={'ghost'}
                              size={'1'}
                              onClick={() => toggleIndicatorOverlay(indicator.tag)}
                            >
                              {indicator.overlay ? <EyeOpenIcon /> : <EyeNoneIcon />}
                            </IconButton>
                          </div>

                          <IconButton
                            color={'gray'}
                            variant={'ghost'}
                            size={'1'}
                            onClick={() => {
                              setCurrentIndicator(indicator);
                              setShowEditIndicatorCodeDialog(true);
                            }}
                          >
                            <CodeIcon color="gray"></CodeIcon>
                          </IconButton>

                          <IconButton
                            color={'tomato'}
                            variant={'ghost'}
                            size={'1'}
                            onClick={() => {
                              const index = userIndicators.findIndex(i => i.tag === indicator.tag);
                              const newIndicators = [...userIndicators];
                              newIndicators.splice(index, 1);
                              setUserIndicators(newIndicators);
                            }}
                          >
                            <TrashIcon color="tomato"></TrashIcon>
                          </IconButton>

                          <IconButton
                            variant={'ghost'}
                            size={'1'}
                            onClick={() => {
                              setCurrentIndicator(indicator);
                              setShowEditIndicatorDialog(true);
                            }}
                          >
                            <Pencil1Icon></Pencil1Icon>
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={'!bg-primary-bg-subtle'}>
              <div className={'flex flex-col w-[300px] gap-3'}>
                <div className={'flex flex-row items-center justify-between'}>
                  <Heading size={'5'} className={'text-primary-text-contrast'}>
                    User series
                  </Heading>

                  <IconButton
                    onClick={() => {
                      setShowDialog(true);
                    }}
                    size={'1'}
                  >
                    <PlusIcon />
                  </IconButton>
                </div>

                {userSeries.map(series => (
                  <div key={series.name} className={'flex flex-row items-center gap-3'}>
                    <div className={'flex flex-col flex-auto bg-primary-bg rounded-lg p-2'}>
                      <div className={'flex flex-row gap-5 justify-between'}>
                        <label className={'font-bold'}>{series.name}</label>

                        <div className={'flex flex-row items-center gap-2'}>
                          <label>Overlay</label>
                          <Checkbox
                            variant={'soft'}
                            color={'jade'}
                            className="border border-primary-border !cursor-pointer"
                            checked={series.overlay}
                            onClick={() => {
                              const index = userSeries.findIndex(s => s.name === series.name);
                              const newSeries = [...userSeries];
                              newSeries[index].overlay = !newSeries[index].overlay;
                              setUserSeries(newSeries);
                            }}
                          />
                        </div>

                        <div className={'flex flex-row items-center gap-3'}>
                          <IconButton
                            variant={'ghost'}
                            onClick={() => {
                              const index = userSeries.findIndex(s => s.name === series.name);
                              const newSeries = [...userSeries];
                              newSeries.splice(index, 1);
                              setUserSeries(newSeries);
                            }}
                          >
                            <TrashIcon color="tomato"></TrashIcon>
                          </IconButton>

                          <IconButton
                            variant={'ghost'}
                            onClick={() => {
                              setCurrentSeries({
                                color: series.color,
                                lineWidth: series.lineWidth,
                                name: series.name,
                                overlay: series.overlay,
                                seriesFunctionString: series.seriesFunctionString,
                              });
                              setShowDialog(true);
                            }}
                          >
                            <Pencil1Icon></Pencil1Icon>
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={'!bg-primary-bg-subtle'}>
              <div className={'flex flex-col w-[300px] gap-3'}>
                <div className={'flex flex-row items-center justify-between'}>
                  <Heading size={'5'} className={'text-primary-text-contrast'}>
                    Triggers
                  </Heading>

                  {/* Consolidate series with names */}
                  {/* Pass to function which receives an array of objects */}

                  <IconButton
                    onClick={() => {
                      setCurrentTrigger(DEFAULT_USER_TRIGGER);
                      setShowTriggerDialog(true);
                    }}
                    size={'1'}
                  >
                    <PlusIcon />
                  </IconButton>
                </div>

                {userTriggers.map(trigger => (
                  <div key={trigger.name} className={'flex flex-row items-center gap-3'}>
                    <div className={'flex flex-col flex-auto bg-primary-bg rounded-lg p-2'}>
                      <div className={'flex flex-row gap-5 justify-between'}>
                        <label className={'font-bold'}>{trigger.name}</label>

                        <div className={'flex flex-row items-center gap-3'}>
                          <IconButton
                            variant={'ghost'}
                            onClick={() => {
                              const index = userTriggers.findIndex(s => s.name === trigger.name);
                              const newTriggers = [...userTriggers];
                              newTriggers.splice(index, 1);
                              setUserTriggers(newTriggers);
                            }}
                          >
                            <TrashIcon color="tomato"></TrashIcon>
                          </IconButton>

                          <IconButton
                            variant={'ghost'}
                            onClick={() => {
                              setCurrentTrigger({
                                color: trigger.color,
                                size: trigger.size,
                                name: trigger.name,
                                triggerFunctionString: trigger.triggerFunctionString,
                                tag: trigger.tag,
                              });
                              setShowTriggerDialog(true);
                            }}
                          >
                            <Pencil1Icon></Pencil1Icon>
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={'!bg-primary-bg-subtle'}>
              <div className={'flex flex-col w-[300px] gap-3'}>
                <div className={'flex flex-row items-center justify-between'}>
                  <Heading size={'5'} className={'text-primary-text-contrast'}>
                    Outcome
                  </Heading>

                  {/* Consolidate series with names */}
                  {/* Pass to function which receives an array of objects */}

                  <IconButton
                    onClick={() => {
                      setCurrentOutcome(DEFAULT_USER_OUTCOME);
                      setShowOutcomeDialog(true);
                    }}
                    size={'1'}
                  >
                    <PlusIcon />
                  </IconButton>
                </div>

                {userOutcome && (
                  <div key={userOutcome.name} className={'flex flex-row items-center gap-3'}>
                    <div className={'flex flex-col flex-auto bg-primary-bg rounded-lg p-2'}>
                      <div className={'flex flex-row gap-5 justify-between'}>
                        <label className={'font-bold'}>{userOutcome.name}</label>

                        <div className={'flex flex-row items-center gap-3'}>
                          <IconButton
                            variant={'ghost'}
                            onClick={() => {
                              setUserOutcome(null);
                              setOutcomeMarkers([]);
                            }}
                          >
                            <TrashIcon color="tomato"></TrashIcon>
                          </IconButton>

                          <IconButton
                            variant={'ghost'}
                            onClick={() => {
                              setCurrentOutcome(userOutcome);
                              setShowOutcomeDialog(true);
                            }}
                          >
                            <Pencil1Icon></Pencil1Icon>
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className={'w-[100%] h-[500px]'}>
            <Card className={'w-full h-full !bg-primary-bg-subtle'}>
              <LightweightChart
                userSeriesData={userSeriesData}
                indicatorData={userIndicatorData}
                candlestickData={candlestickData}
                seriesMarkers={[
                  ...triggerMarkers.map(t => ({
                    ...t,
                    color: displayMode.mode === 'dark' ? '#D4FF70' : '#8DB654',
                  })),
                  ...outcomeMarkers.map(t => ({
                    ...t,
                    color:
                      t.shape === 'arrowUp'
                        ? displayMode.mode === 'dark'
                          ? '#1FD8A4'
                          : '#208368'
                        : displayMode.mode === 'dark'
                          ? '#FF977D'
                          : '#D13415',
                  })),
                ].sort((a, b) => (a.time as number) - (b.time as number))}
                visibleRange={200}
                // seriesMarkers={triggerMarkers}
                color={{
                  background: displayMode.mode === 'dark' ? '#18191B' : '#F9F9FB',
                  text: displayMode.mode === 'dark' ? '#B0B4BA' : '#60646C',
                  gridLines: displayMode.mode === 'dark' ? '#363A3F' : '#D9D9E0',
                  scale: displayMode.mode === 'dark' ? '#5A6169' : '#B9BBC6',
                }}
              />
            </Card>
          </div>
        </div>
      </div>
      <AddIndicatorDialog
        show={showAddIndicatorDialog}
        onIndicatorSelected={(indicator: Indicator) => {
          // Check how many of this indicator type already exist
          const existingIndicators = userIndicators.filter(i => i.type === indicator.type);
          const indicatorCount = existingIndicators.length;

          const newIndicator: Indicator = {
            tag: indicatorCount ? `${indicator.tag}${indicatorCount + 1}` : indicator.tag,
            funcStr: indicator.funcStr,
            type: indicator.type,
            params: indicator.params,
            label: indicator.label,
            overlay: indicator.overlay,
            streams: indicator.streams,
          };

          setUserIndicators([...userIndicators, newIndicator]);
          setShowAddIndicatorDialog(false);
        }}
        onClose={() => {
          setShowAddIndicatorDialog(false);
        }}
      />
      <EditIndicatorDialog
        show={showEditIndicatorDialog}
        existingIndicators={userIndicators}
        indicator={currentIndicator}
        setIndicator={setCurrentIndicator}
        onSaveClicked={() => {
          const dialogIndicator: Indicator = {
            tag: currentIndicator.tag,
            funcStr: currentIndicator.funcStr,
            type: currentIndicator.type,
            params: currentIndicator.params,
            label: currentIndicator.label,
            overlay: currentIndicator.overlay,
            streams: currentIndicator.streams,
          };

          const index = userIndicators.findIndex(i => i.tag === currentIndicator.tag);

          if (index !== -1) {
            // Update existing indicator
            const newIndicators = [...userIndicators];
            newIndicators[index] = dialogIndicator;

            setUserIndicators(newIndicators);
          } else {
            // Add dialog indicator
            setUserIndicators([...userIndicators, dialogIndicator]);
          }

          setCurrentIndicator(DEFAULT_INDICATOR);

          setShowEditIndicatorDialog(false);
        }}
        onCancelClicked={() => {
          setCurrentIndicator(DEFAULT_INDICATOR);
          setShowEditIndicatorDialog(false);
        }}
      />

      <EditIndicatorCodeDialog
        show={showEditIndicatorCodeDialog}
        existingIndicators={userIndicators}
        indicator={currentIndicator}
        setIndicator={setCurrentIndicator}
        onSaveClicked={(funcStr: string) => {
          const dialogIndicator: Indicator = {
            ...currentIndicator,
            funcStr,
          };

          const index = userIndicators.findIndex(i => i.tag === currentIndicator.tag);

          if (index !== -1) {
            // Update existing indicator
            const newIndicators = [...userIndicators];
            newIndicators[index] = dialogIndicator;

            setUserIndicators(newIndicators);
          } else {
            // Add dialog indicator
            setUserIndicators([...userIndicators, dialogIndicator]);
          }

          setCurrentIndicator(DEFAULT_INDICATOR);
          setShowEditIndicatorCodeDialog(false);
        }}
        onCancelClicked={() => {
          setCurrentIndicator(DEFAULT_INDICATOR);
          setShowEditIndicatorCodeDialog(false);
        }}
      />

      <UserSeriesDialog
        show={showDialog}
        series={currentSeries}
        setSeries={setCurrentSeries}
        onSaveClicked={() => {
          const dialogSeries = {
            name: currentSeries.name,
            seriesFunctionString: currentSeries.seriesFunctionString,
            overlay: currentSeries.overlay,
            color: currentSeries.color,
            lineWidth: currentSeries.lineWidth,
          };

          const index = userSeries.findIndex(s => s.name === currentSeries.name);

          if (index !== -1) {
            // Update existing series
            const newSeries = [...userSeries];
            newSeries[index] = dialogSeries;

            setUserSeries(newSeries);
          } else {
            // Add dialog series
            setUserSeries([...userSeries, dialogSeries]);
          }

          setCurrentSeries(DEFAULT_USER_SERIES);

          setShowDialog(false);
        }}
        onCancelClicked={() => {
          setCurrentSeries(DEFAULT_USER_SERIES);
          setShowDialog(false);
        }}
      />
      <UserTriggerDialog
        show={showTriggerDialog}
        trigger={currentTrigger}
        setTrigger={setCurrentTrigger}
        onSaveClicked={() => {
          const updatedTriggers = [...userTriggers];
          const triggerIndex = updatedTriggers.findIndex(t => t.tag === currentTrigger.tag);

          if (triggerIndex !== -1) {
            // Update existing trigger
            updatedTriggers[triggerIndex] = currentTrigger;
          } else {
            // Add new trigger
            updatedTriggers.push({
              ...currentTrigger,
              tag: Date.now().toString(),
            });
          }

          setUserTriggers(updatedTriggers);
          setShowTriggerDialog(false); // Close the dialog
        }}
        onCancelClicked={() => {
          setCurrentTrigger(DEFAULT_USER_TRIGGER);
          setShowTriggerDialog(false);
        }}
      />
      <UserOutcomeDialog
        show={showOutcomeDialog}
        outcome={currentOutcome}
        setOutcome={setCurrentOutcome}
        onSaveClicked={() => {
          setUserOutcome(currentOutcome);
          setShowOutcomeDialog(false); // Close the dialog
        }}
        onCancelClicked={() => {
          setCurrentOutcome(DEFAULT_USER_OUTCOME);
          setShowOutcomeDialog(false);
        }}
      />
    </>
  );
};

export default App;

const DEFAULT_INDICATOR: Indicator = PRESET_INDICATOR_SMA;

const DEFAULT_USER_SERIES: UserSeries = {
  name: '',
  seriesFunctionString: `const windowSize = 20;  // Setting the period for SMA
  
const smaData = data.map((current, index) => {
  if (index >= windowSize - 1) {
    // Calculate SMA only when there are enough preceding data points
    let sum = 0;
    // Sum the closing prices of the last 'windowSize' days
    for (let i = index - windowSize + 1; i <= index; i++) {
      sum += data[i].close;
    }
    let average = sum / windowSize;
    return { time: current.time, value: average };
  } else {
    return null;  // Not enough data to calculate SMA
  }
});
 
return smaData.filter(item => item !== null);
/* Close example:
return data.map(d => ({ time: d.time, value: d.close }));
*/

/*
Lookback offset example:

const offsetData = data.map((d, index) => {
  return (index >= 5) ? { time: d.time, value: data[index - 5].close } : null
})

return offsetData.filter(item => item !== null);
*/

/*
High pivots example:

const pivotData = data.map((d, index) => {
  if (index >= 10) { 
    let validPivots = [];
    for (let i = index - 10; i <= index - 3; i++) {
      if (data[i].close < data[i+1].close && data[i+2].close < data[i+1].close) {
        validPivots.push(data[i+1].close); // Push the value of the higher high
      }
    }

    if (validPivots.length > 0) {
      let highestPivot = Math.max(...validPivots);
      return { time: d.time, value: highestPivot };
    }
  }
  return null;
});

return pivotData.filter(item => item !== null);
*/`,
  overlay: true,
  color: '#ffffff',
  lineWidth: 1,
};

const DEFAULT_USER_TRIGGER = {
  tag: '',
  name: '',
  triggerFunctionString: `
  // Crossing about the 'sma' series after being below for at two candles
  return (
    data[0].close > data[0].sma &&
    data[1].close <= data[1].sma &&
    data[2].close < data[2].sma
  );
  `,
  color: '',
  size: 1,
};

const DEFAULT_USER_OUTCOME: UserOutcome = {
  tag: '',
  name: '',
  outcomeFunctionString: `
  if (data[0].high > trigger.value * 1.02) {
    return 'success';
  } else if (data[0].low < trigger.value * 0.98) {
    return 'failure';
  }
  
  return 'uncertain';
  `,
  color: '',
  size: 1,
};
