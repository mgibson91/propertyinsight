'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CandlestickData, LineData, OhlcData, SeriesMarker, UTCTimestamp } from 'lightweight-charts';
import { fetchCandlesFromMemory } from '@/requests/get-bitcoin-prices';
import { calculateTriggers } from '@/logic/calculate-triggers';
import { calculateOutcomes } from '@/logic/calculate-outcomes';
import { v4 as uuid } from 'uuid';
import {
  Button,
  Card,
  Checkbox,
  Code,
  Dialog,
  Heading,
  IconButton,
  Popover,
  Select,
  TextFieldInput,
} from '@radix-ui/themes';
import {
  BarChartIcon,
  CheckboxIcon,
  CodeIcon,
  CopyIcon,
  Cross1Icon,
  Cross2Icon,
  EyeNoneIcon,
  EyeOpenIcon,
  GearIcon,
  LightningBoltIcon,
  Pencil1Icon,
  Pencil2Icon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { LightweightChart } from '@/components/LightweightChart';
import { UserSeriesDialog } from '@/components/UserSeriesDialog';
import { UserTriggerDialog } from '@/components/UserTriggerDialog';
import { UserOutcomeDialog } from '@/components/UserOutcomeDialog';
import { useMatchingSnapshot } from '@/app/matching-snapshot-provider';
import { useDisplayMode } from '@/app/display-mode-aware-radix-theme-provider';
// import { getConsolidatedSeries } from '@/app/(logic)/get-consolidated-series';
import { GenericData, UserOutcome, UserSeries, UserSeriesData, UserTrigger } from '@/app/(logic)/types';
import { EditIndicatorDialog } from '@/components/edit-indicator-dialog';
import {
  generateSmaPreset,
  MUCKABOUT,
  PRESET_INDICATOR_EMA,
  PRESET_INDICATOR_SMA,
} from '@/logic/indicators/preset-indicator';
import { AddIndicatorDialog } from '@/components/add-indicator-dialog';
import SlideToggle2 from '@/shared/layout/slide-toggle2';
import { Toast } from '@/shared/toast';
import { EditIndicatorCodeDialog } from '@/components/edit-indicator-code-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditorTab } from '@/app/dashboard/_components/editor-tab';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useDebounceCallback } from 'usehooks-ts';
import dynamic from 'next/dynamic';
import { StrategiesTab } from '@/app/dashboard/_components/strategies-tab';
import { getConsolidatedSeriesNew } from '@/app/(logic)/get-consolidated-series-new';
import * as z from 'zod';
import { Indicator, IndicatorSchema } from '@/logic/indicators/types';
import { parseFunctionReturnKeys } from '@/app/(logic)/parse-function-return-key';
import { DEFAULT_OPERATORS, EditTrigger, Trigger } from '@/components/triggers/edit-trigger';
import { DEFAULT_FIELDS } from '@/app/(logic)/get-indicator-stream-tags';
import { calculateTriggerEvents } from '@/app/(logic)/calculate-trigger-events';

// const IndicatorSchema = z.object({
//   id: z.string(),
//   tag: z.string(),
//   label: z.string(),
//   funcStr: z.string(),
//   params: z.array(
//     z.object({
//       name: z.string(),
//       type: z.string(),
//       label: z.string(),
//       required: z.boolean(),
//       value: z.any(),
//       defaultValue: z.any(),
//     })
//   ),
//   overlay: z.boolean(),
//   properties: z.array(z.string()),
//   streams: z.array(
//     z.object({
//       tag: z.string(),
//       overlay: z.boolean(),
//       color: z.string(),
//       lineWidth: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
//     })
//   ),
// });
//
// type Indicator = z.infer<typeof IndicatorSchema>;

const StrategySchema = z.object({
  id: z.string(),
  name: z.string(),
  indicators: z.array(IndicatorSchema),
  triggers: z.array(z.any()),
  outcomes: z.array(z.any()),
});

type Strategy = z.infer<typeof StrategySchema>;

const INITIAL_USER_TRIGGERS: UserTrigger[] = [
  // {
  //   id: '1',
  //   name: 'sma crossover',
  //   triggerFunctionString: `return data[0].sma20 > data[0].sma50 && data[1].sma20 < data[1].sma50`,
  //   size: 2,
  //   color: '#ffffff',
  // },
];

const INITIAL_USER_OUTCOME: UserOutcome = {
  id: '1',
  name: '2% either way',
  outcomeFunctionString: `if (data[0].high > trigger.value * 1.02) {
    return 'success';
  } else if (data[0].low < trigger.value * 0.98) {
    return 'failure';
  }

  return 'uncertain';`,
  color: '',
  size: 1,
};

function convertStreamsToChartSeries(
  streamDataMap: Record<string, LineData<UTCTimestamp>[]>,
  indicators: Indicator[]
): {
  overlay: boolean;
  data: LineData<UTCTimestamp>[];
  color: string;
  lineWidth: 1 | 2 | 3 | 4;
}[] {
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

const DEFAULT_STRATEGY: Strategy = {
  id: '',
  name: '',
  indicators: [PRESET_INDICATOR_SMA],
  triggers: [
    {
      id: '1',
      name: 'sma crossover',
      triggerFunctionString: `return data[0].sma20 > data[0].sma50 && data[1].sma20 < data[1].sma50`,
      size: 2,
      color: '#ffffff',
    },
  ],
  outcomes: [],
};

type Size = {
  width?: number;
  height?: number;
};

// Load strategies from local storage and TODO: do a Zod validation to make sure it's all good
async function loadStrategies(): Promise<Strategy[]> {
  const strategies = localStorage.getItem('strategies');
  if (strategies) {
    const json = JSON.parse(strategies);
    const parsed = z.array(StrategySchema).parse(json);
    return parsed;
  }

  return [];
}

async function saveStrategies(strategies: Strategy[]) {
  localStorage.setItem('strategies', JSON.stringify(strategies));
}

const generateEmptyStrategy = (name?: string): Strategy => ({
  id: uuid(),
  name: name || 'Default',
  indicators: [
    generateSmaPreset({
      tag: 'sma20',
      series: 'close',
      length: 20,
      color: '#FF0000',
    }),
    generateSmaPreset({
      tag: 'sma50',
      series: 'close',
      length: 50,
      color: '#00FF00',
    }),
  ],
  triggers: [],
  outcomes: [],
});

const App = () => {
  const chartRef = useRef(null);
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

  // Displayed - these need to change on current indicator <-> strategy switch
  const [userIndicators, setUserIndicators] = useState<Array<Indicator>>([
    PRESET_INDICATOR_SMA,
    PRESET_INDICATOR_EMA,
    MUCKABOUT,
  ]);

  const [triggers, setTriggers] = useState<Trigger[]>([]);

  // TODO: REmove
  const [userTriggers, setUserTriggers] = useState<UserTrigger[]>([]);
  const [userOutcome, setUserOutcome] = useState<UserOutcome[]>([]);
  const [triggerMarkers, setTriggerMarkers] = useState<SeriesMarker<UTCTimestamp>[]>([]);
  const [outcomeMarkers, setOutcomeMarkers] = useState<SeriesMarker<UTCTimestamp>[]>([]);

  // Caches current strategy edits for user experimentation - no need for save to chart
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>({
    id: '1234',
    name: 'Default',
    indicators: [PRESET_INDICATOR_SMA],
    triggers: [],
    outcomes: [],
  });

  const [newStrategyName, setNewStrategyName] = useState<string>('');

  const [markerSnapshots, setMarkerSnapshots] = useMatchingSnapshot();

  const [displayMode] = useDisplayMode();

  const [tabResetKey, setTabResetKey] = useState<number>(0);

  // We display
  const [bottomTab, setBottomTab] = useState<'editor' | 'strategies' | undefined>();

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

  // TODO: Make this dialog indicator
  const [currentIndicator, setCurrentIndicator] = useState<Indicator>(DEFAULT_INDICATOR);
  const [editorIndicator, setEditorIndicator] = useState<Indicator | undefined>(undefined);
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
  const [showAddIndicatorDialog, setShowAddIndicatorDialog] = useState(false);
  const [editTrigger, setEditTrigger] = useState<{
    trigger?: Trigger;
    display: boolean;
  }>({
    trigger: undefined,
    display: false,
  });
  const [showEditIndicatorDialog, setShowEditIndicatorDialog] = useState(false);
  const [showEditIndicatorCodeDialog, setShowEditIndicatorCodeDialog] = useState(false);
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);
  const [showOutcomeDialog, setShowOutcomeDialog] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [candlesPerSecond, setCandlesPerSecond] = useState<number>(1);

  // Load strategies from local storage
  useEffect(() => {
    const asyncLoadStrategies = async () => {
      const strategies = await loadStrategies();

      let activeStrategy: Strategy;

      if (strategies.length === 0) {
        const defaultStrategy = generateEmptyStrategy();
        setStrategies([defaultStrategy]);
        activeStrategy = defaultStrategy;
      } else {
        setStrategies(strategies);
        activeStrategy = strategies[0];
      }

      setSelectedStrategy(activeStrategy);

      // Set local yokes for speed
      setUserIndicators(activeStrategy.indicators);
    };

    asyncLoadStrategies();
  }, []);

  // Add new indicator
  const centralAddIndicator = async (indicator: Indicator) => {
    const newIndicators = [...userIndicators, indicator];

    // Local updates for rapidity
    setUserIndicators(newIndicators);

    const newStrategies = strategies.map(strategy => {
      if (strategy.id === selectedStrategy.id) {
        return {
          ...strategy,
          indicators: newIndicators,
        };
      }

      return strategy;
    });

    // Save to strategy
    await saveStrategies(newStrategies);
  };

  // Add new indicator
  const centralAddTrigger = async (trigger: Trigger) => {
    const newTriggers = [...triggers, trigger];

    // Local updates for rapidity
    setTriggers(newTriggers);

    const newStrategies = strategies.map(strategy => {
      if (strategy.id === selectedStrategy.id) {
        return {
          ...strategy,
          triggers: newTriggers,
        };
      }

      return strategy;
    });

    // Save to strategy
    await saveStrategies(newStrategies);
  };

  // Add new indicator
  const centralEditIndicator = async (indicator: Indicator) => {
    // Local updates for rapidity
    const newIndicators = userIndicators.map(i => {
      if (i.tag === indicator.tag) {
        return indicator;
      }

      return i;
    });

    // Local updates for rapidity
    setUserIndicators(newIndicators);

    const newStrategies = strategies.map(strategy => {
      if (strategy.id === selectedStrategy.id) {
        return {
          ...strategy,
          indicators: newIndicators,
        };
      }

      return strategy;
    });

    // Save to strategy
    await saveStrategies(newStrategies);
  };

  // Add new indicator
  const centralEditTrigger = async (trigger: Trigger) => {
    // Local updates for rapidity
    const newTriggers = triggers.map(t => {
      if (t.id === trigger.id) {
        return trigger;
      }

      return t;
    });

    // Local updates for rapidity
    setTriggers(newTriggers);

    const newStrategies = strategies.map(strategy => {
      if (strategy.id === selectedStrategy.id) {
        return {
          ...strategy,
          triggers: newTriggers,
        };
      }

      return strategy;
    });

    // Save to strategy
    await saveStrategies(newStrategies);
  };

  const centralDeleteIndicator = async (tag: string) => {
    const newIndicators = userIndicators.filter(i => i.tag !== tag);

    // Local updates for rapidity
    setUserIndicators(newIndicators);

    const newStrategies = strategies.map(strategy => {
      if (strategy.id === selectedStrategy.id) {
        return {
          ...strategy,
          indicators: newIndicators,
        };
      }

      return strategy;
    });

    // Save to strategy
    await saveStrategies(newStrategies);
  };

  const centralDeleteTrigger = async (id: string) => {
    const newTriggers = triggers.filter(i => i.id !== id);

    // Local updates for rapidity
    setTriggers(newTriggers);

    const newStrategies = strategies.map(strategy => {
      if (strategy.id === selectedStrategy.id) {
        return {
          ...strategy,
          triggers: newTriggers,
        };
      }

      return strategy;
    });

    // Save to strategy
    await saveStrategies(newStrategies);
  };

  const resizeChart = useDebounceCallback(() => {
    if (chartRef.current) {
      (chartRef.current as any).resize();
    }
  }, 200);

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
    setUserIndicators(selectedStrategy?.indicators || []);
    setTriggers(selectedStrategy?.triggers || []);

    // setUserSeries(INITIAL_USER_SERIES);
    // setUserTriggers(INITIAL_USER_TRIGGERS);
    // setUserOutcome(INITIAL_USER_OUTCOME);
    // setUserSeries(selectedStrategy?.indicators || []);
  }, [selectedStrategy]);

  useEffect(() => {
    handleFetchClick();
  }, [ticker, timeframe, startDate, endDate, userSeries, triggers, userOutcome, userIndicators]);

  const handleFetchClick = async () => {
    setLoading(true);
    setError(null);
    try {
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

      setCandlestickData(formattedCandles);

      const indicatorInputMap: Record<string, Record<string, unknown>> = {};
      for (const indicator of userIndicators) {
        // Input object for this indicator
        const indicatorInput: Record<string, unknown> = {};

        // Add all params to the input object
        for (const param of indicator.params) {
          // TODO: Store indicator inputs elsewhere?
          indicatorInput[param.name] =
            param.value == null || param.value === '' || isNaN(param.value) ? param.defaultValue : param.value;
        }

        indicatorInputMap[indicator.tag] = indicatorInput;
      }

      const consolidatedSeries = getConsolidatedSeriesNew({
        data: formattedCandles as unknown as GenericData[],
        indicators: userIndicators,
        defaultFields: DEFAULT_FIELDS,
        indicatorInputMap,
      });

      const localIndicatorData: {
        overlay: boolean;
        data: LineData<UTCTimestamp>[];
        color: string;
        lineWidth: 1 | 2 | 3 | 4;
      }[] = [];

      // Ignoring <defaultFields> and 'time', create an array of LineData for each indicator
      for (const indicator of userIndicators) {
        for (const stream of indicator.streams) {
          const indicatorData = consolidatedSeries.data
            .map(data => {
              return {
                time: data.time,
                value: data[`${indicator.tag}_${stream.tag}`] || null,
              };
            })
            .filter(data => data.value !== null);

          localIndicatorData.push({
            overlay: indicator.overlay,
            data: indicatorData as LineData<UTCTimestamp>[],
            color: stream.color, // TODO: Each stream as configured
            lineWidth: stream.lineWidth, // TODO: Each stream as configured
          });
        }
      }

      setUserIndicatorData(localIndicatorData);

      const triggerEvents = calculateTriggerEvents({
        data: consolidatedSeries.data,
        triggers,
        delayMap: consolidatedSeries.delayMap,
        streams: consolidatedSeries.streams,
      });

      // Convert trigger markers to chart
      const newTriggerMarkers = Object.values(triggerEvents || {}).flatMap(time => {
        return time.map(time => {
          return {
            time,
            text: '',
            position: 'belowBar',
            color: displayMode.mode === 'dark' ? '#BDE56C' : '#5C7C2F',
            shape: 'arrowUp',
            size: 3,
          };
        });
      });

      setTriggerMarkers(newTriggerMarkers);

      //
      // /**
      //  * Get Consolidated series
      //  * Instantiate user marker trigger function
      //  * It rate through consolidated series array
      //  * At each point, Iterate through trigger functions
      //  * If trigger function returns true, add marker to array
      //  */
      //
      // const markerFunctionMap = new Map<
      //   string,
      //   {
      //     lookback: number;
      //     func: Function; // (data: ConsolidatedLineData[]) => boolean;
      //   }
      // >();
      //
      // for (const trigger of triggers) {
      //   markerFunctionMap.set(trigger.name, {
      //     // TODO: Consider this - should in theory be the min required but hardcoded for display ease
      //     // lookback: HISTORICAL_VALUE_COUNT,
      //     lookback: 50,
      //     func: new Function('data', trigger.),
      //   });
      // }
      //
      // // 2. matchingMarkers is ready to go
      // const { matchingMarkers, conditionMarkers } = calculateTriggers(
      //   markerFunctionMap,
      //   consolidatedSeries,
      //   newUserSeriesData as UserSeriesData[],
      //   displayMode.mode === 'dark'
      // );
      //
      // let calculatedOutcomeMarkers: {
      //   marker: SeriesMarker<UTCTimestamp>;
      //   outcome: { time: number; offset: number; value: number };
      // }[] = [];
      //
      // if (userOutcome) {
      //   const outcomeUserFunc = new Function('data', 'trigger', userOutcome.outcomeFunctionString);
      //
      //   // 3. calculate outcomes
      //   const { outcomes, summary } = calculateOutcomes({
      //     consolidatedSeries,
      //     triggers: conditionMarkers.map(condition => {
      //       // triggers: [conditionMarkers[0]].map((condition) => {
      //       return {
      //         time: condition.marker.time as number,
      //         offset: consolidatedSeries.findIndex(c => c.time === condition.marker.time),
      //         text: condition.marker.text || '?',
      //       };
      //     }),
      //     outcomeFunc: outcomeUserFunc,
      //     // outcomeFunc: (
      //     //   data: ConsolidatedLineData[],
      //     //   trigger: { value: number }
      //     // ) => {
      //     //   if (data[0].high > trigger.value * 1.02) {
      //     //     return 'success';
      //     //   } else if (data[0].low < trigger.value * 0.98) {
      //     //     return 'failure';
      //     //   }
      //     //
      //     //   return 'uncertain';
      //     // },
      //   });
      //
      //   // Convert outcomes to markers
      //   calculatedOutcomeMarkers = outcomes.map(outcome => {
      //     return {
      //       marker: {
      //         time: outcome.outcome.time,
      //         position: outcome.type === 'success' ? 'belowBar' : 'aboveBar', // 'inBar',
      //         color:
      //           outcome.type === 'success'
      //             ? displayMode.mode === 'dark'
      //               ? '#1FD8A4'
      //               : '#208368'
      //             : displayMode.mode === 'dark'
      //               ? '#FF977D'
      //               : '#D13415',
      //         shape: outcome.type === 'success' ? 'arrowUp' : 'arrowDown',
      //         size: 2,
      //         text: outcome.text,
      //       } as SeriesMarker<UTCTimestamp>,
      //       outcome: outcome.outcome,
      //     };
      //   });
      //
      //   setOutcomeMarkers(calculatedOutcomeMarkers.map(outcome => outcome.marker));
      //   setOutcomeSummary({
      //     failCount: summary.failCount,
      //     successCount: summary.successCount,
      //     winPerc: (summary.successCount / (summary.successCount + summary.failCount)) * 100,
      //   });
      // }
      //
      // setTriggerMarkers(matchingMarkers);
      // setMarkerSnapshots(
      //   conditionMarkers.map(marker => {
      //     const result: {
      //       marker: SeriesMarker<UTCTimestamp>;
      //       candlestickData: OhlcData<UTCTimestamp>[];
      //       userSeriesData: UserSeriesData[];
      //       outcome?: {
      //         outcomeDetails: {
      //           offset: number;
      //           value: number;
      //           text: string;
      //         };
      //         marker: SeriesMarker<UTCTimestamp>;
      //       };
      //       historicalCandles: number;
      //     } = marker;
      //
      //     const outcome = calculatedOutcomeMarkers.find(outcome => outcome.marker.text === marker.marker.text);
      //     if (outcome) {
      //       result.outcome = {
      //         outcomeDetails: {
      //           offset: outcome.outcome.offset,
      //           value: outcome.outcome.value,
      //           text: outcome.marker.text || 'N/A',
      //         },
      //         marker: outcome.marker,
      //       };
      //     }
      //
      //     return result;
      //   })
      // );
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
  };

  useEffect(() => {
    const handleKeyDown = (event: any) => {
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

  function ChartPanel() {
    return (
      <div className={'flex flex-col w-full flex-auto !bg-primary-base relative'}>
        <div className={'absolute top-3 left-3 flex flex-col items-start z-[100]'}>
          {userIndicators.map(indicator => (
            <div key={indicator.tag} className={'flex flex-row items-center gap-3'}>
              <div
                className={
                  'flex flex-col flex-auto bg-transparent hover:bg-primary-bg hover:ring-[1px] hover:ring-inset hover:ring-primary-border p-1 rounded-md'
                }
              >
                <div className={'flex flex-row gap-3 justify-between group'}>
                  <div className={'flex flex-row items-center gap-2'}>
                    <BarChartIcon className={'w-3 h-3'} />
                    <label className={'font-medium text-sm'}>{indicator.label}</label>
                    <Code className="!text-[10px]">{indicator.tag}</Code>
                    {Boolean(indicator.params.length) && (
                      <p className="text-xs">
                        (
                        {indicator.params
                          .map(i => (i.value == null || i.value === '' ? i.defaultValue : i.value))
                          .join(', ')}
                        )
                      </p>
                    )}
                  </div>
                  <div className={'flex-row items-center gap-2 hidden group-hover:flex'}>
                    <div className={'flex flex-row items-center gap-2'}>
                      <IconButton variant={'ghost'} size={'1'} onClick={() => toggleIndicatorOverlay(indicator.tag)}>
                        {indicator.overlay ? <EyeOpenIcon /> : <EyeNoneIcon />}
                      </IconButton>
                    </div>

                    <IconButton
                      color={'gray'}
                      variant={'ghost'}
                      size={'1'}
                      onClick={() => {
                        setEditorIndicator(indicator);
                        // setShowEditIndicatorCodeDialog(true);
                        setBottomTab('editor');
                      }}
                    >
                      <CodeIcon color="gray"></CodeIcon>
                    </IconButton>

                    <IconButton
                      variant={'ghost'}
                      size={'1'}
                      onClick={() => {
                        setCurrentIndicator(indicator);
                        setShowEditIndicatorDialog(true);
                      }}
                    >
                      <GearIcon></GearIcon>
                    </IconButton>

                    <IconButton
                      color={'tomato'}
                      variant={'ghost'}
                      size={'1'}
                      onClick={async () => {
                        await centralDeleteIndicator(indicator.tag);

                        // const index = userIndicators.findIndex(i => i.tag === indicator.tag);
                        // const newIndicators = [...userIndicators];
                        // newIndicators.splice(index, 1);
                        // setUserIndicators(newIndicators);
                      }}
                    >
                      <Cross1Icon color="tomato"></Cross1Icon>
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {triggers.map(trigger => (
            <div key={trigger.name} className={'flex flex-row items-center gap-3'}>
              <div
                className={
                  'flex flex-col flex-auto bg-transparent hover:bg-primary-bg hover:ring-[1px] hover:ring-inset hover:ring-primary-border p-1 rounded-md'
                }
              >
                <div className={'flex flex-row gap-3 justify-between group'}>
                  <div className={'flex flex-row items-center gap-2'}>
                    <LightningBoltIcon className={'w-3 h-3'} />
                    <label className={'font-medium text-sm'}>{trigger.name}</label>
                    {/*<Code className="!text-[10px]">{indicator.tag}</Code>*/}
                    {/*{Boolean(indicator.params.length) && (*/}
                    {/*  <p className="text-xs">*/}
                    {/*    (*/}
                    {/*    {indicator.params*/}
                    {/*      .map(i => (i.value == null || i.value === '' ? i.defaultValue : i.value))*/}
                    {/*      .join(', ')}*/}
                    {/*    )*/}
                    {/*  </p>*/}
                    {/*)}*/}
                  </div>
                  <div className={'flex-row items-center gap-2 hidden group-hover:flex'}>
                    <div className={'flex flex-row items-center gap-2'}>
                      <IconButton
                        variant={'ghost'}
                        size={'1'}
                        onClick={() => {
                          // TODO: Central edit trigger
                          const newTriggers = triggers.map(t => {
                            if (t.name === trigger.name) {
                              return {
                                ...t,
                                enabled: !t.enabled,
                              };
                            }

                            return t;
                          });

                          setTriggers(newTriggers);
                        }}
                      >
                        {trigger.enabled ? <EyeOpenIcon /> : <EyeNoneIcon />}
                      </IconButton>
                    </div>

                    {/*TODO: View and edit code - override if edited*/}
                    <IconButton
                      color={'gray'}
                      variant={'ghost'}
                      size={'1'}
                      onClick={() => {
                        // TODO: Trigger code edit
                        setEditTrigger({
                          trigger,
                          display: true,
                        });
                      }}
                    >
                      <CodeIcon color="gray"></CodeIcon>
                    </IconButton>

                    <IconButton
                      variant={'ghost'}
                      size={'1'}
                      onClick={() => {
                        setEditTrigger({
                          trigger,
                          display: true,
                        });
                      }}
                    >
                      <GearIcon></GearIcon>
                    </IconButton>

                    <IconButton
                      color={'tomato'}
                      variant={'ghost'}
                      size={'1'}
                      onClick={async () => {
                        await centralDeleteTrigger(trigger.id);
                        // await centralDeleteIndicator(indicator.tag);
                        // const index = userIndicators.findIndex(i => i.tag === indicator.tag);
                        // const newIndicators = [...userIndicators];
                        // newIndicators.splice(index, 1);
                        // setUserIndicators(newIndicators);
                      }}
                    >
                      <Cross1Icon color="tomato"></Cross1Icon>
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <LightweightChart
          ref={chartRef}
          userSeriesData={[]}
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
            background: displayMode.mode === 'dark' ? '#111113' : '#F9F9FB',
            text: displayMode.mode === 'dark' ? '#B0B4BA' : '#60646C',
            gridLines: displayMode.mode === 'dark' ? '#363A3F' : '#D9D9E0',
            scale: displayMode.mode === 'dark' ? '#5A6169' : '#B9BBC6',
          }}
        />
      </div>
    );
  }

  function SecondaryPanel() {
    return (
      <Tabs
        className="w-full"
        value={bottomTab}
        onFocus={() => {
          // Need as first setBottomTab from non resizable panel wasn't setting value
          if (!bottomTab) {
            setBottomTab('editor');
          }
        }}
      >
        <TabsList className={'flex gap-2 justify-start px-3'}>
          <TabsTrigger
            value="editor"
            onClick={() => {
              if (bottomTab === 'editor') {
                setBottomTab(null as any);
              } else {
                setBottomTab('editor');
              }
            }}
          >
            Code Editor
          </TabsTrigger>
          <TabsTrigger
            value="strategies"
            onClick={() => {
              if (bottomTab === 'strategies') {
                setBottomTab(null as any);
              } else {
                setBottomTab('strategies');
              }
            }}
          >
            Strategy Performance
          </TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <EditorTab
            existingIndicators={userIndicators}
            indicator={editorIndicator}
            // setIndicator={setCurrentIndicator}
            onSaveToChartClicked={async partialIndicator => {
              const { tag, label, funcStr, params, streams, properties } = partialIndicator;
              const index = userIndicators.findIndex(i => i.tag === tag);

              if (index !== -1) {
                // // Update existing indicator
                // const newIndicators = userIndicators.map((indicator, i) => {
                //   if (i === index) {
                //     return {
                //       ...indicator,
                //       ...partialIndicator,
                //     };
                //   }
                //
                //   return indicator;
                // });

                await centralEditIndicator({
                  ...userIndicators[index],
                  ...partialIndicator,
                });
                // setUserIndicators(newIndicators);
              } else {
                // Add dialog indicator
                const newIndicator: Indicator = {
                  id: uuid(),
                  tag,
                  label,
                  funcStr,
                  params,
                  streams,
                  overlay: true,
                  properties,
                };

                setUserIndicators([...userIndicators, newIndicator]);

                await centralAddIndicator(newIndicator);
              }

              // setCurrentIndicator(dialogIndicator);
              // setShowEditIndicatorCodeDialog(false);
            }}
            onSaveToLibraryClicked={input => {}}
            onSaveToStrategyClicked={input => {}}
          />
        </TabsContent>
        <TabsContent value="strategies">
          <StrategiesTab />
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <>
      <div className={'flex-auto flex flex-col w-[100vw]'}>
        {/*<div className={'flex flex-row gap-2 m-5 w-full pr-10'}>*/}
        {/*  <Card className={''}>*/}
        {/*    <div className={'flex flex-row items-center gap-3'}>*/}
        {/*      <div className={'flex flex-col'}>*/}
        {/*        <label>Ticker</label>*/}
        {/*        <TickerSelector*/}
        {/*          options={[*/}
        {/*            // { value: 'FETUSD', label: 'FET/USD' },*/}
        {/*            { value: 'BTCUSD', label: 'BTC/USD' },*/}
        {/*            // { value: 'ETHUSD', label: 'ETH/USD' },*/}
        {/*          ]}*/}
        {/*          value={ticker}*/}
        {/*          onChange={selectedOption => setTicker(selectedOption)}*/}
        {/*        />*/}
        {/*      </div>*/}

        {/*      <div className={'flex flex-col'}>*/}
        {/*        <label>Timeframe</label>*/}
        {/*        <TimeFrameSelector*/}
        {/*          options={[*/}
        {/*            // { value: '15m', label: '15m' },*/}
        {/*            { value: '1h', label: '1h' },*/}
        {/*          ]}*/}
        {/*          value={timeframe}*/}
        {/*          onChange={selectedOption => setTimeframe(selectedOption)}*/}
        {/*        />*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </Card>*/}

        {/*  <Card className={''}>*/}
        {/*    <div className={'flex flex-row items-center gap-3'}>*/}
        {/*      <div className={'flex flex-col'}>*/}
        {/*        <label>Start Time</label>*/}
        {/*        /!*<DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} />*!/*/}
        {/*        /!*Change to use normal html input date*!/*/}
        {/*        <TextFieldInput*/}
        {/*          type="date"*/}
        {/*          value={startDate.toISOString().split('T')[0]} // Format the date to 'YYYY-MM-DD'*/}
        {/*          onChange={e => setStartDate(new Date(e.target.value))}*/}
        {/*        />*/}
        {/*      </div>*/}

        {/*      <div className={'flex flex-col'}>*/}
        {/*        <label>End Time</label>*/}
        {/*        <TextFieldInput*/}
        {/*          type="date"*/}
        {/*          value={endDate.toISOString().split('T')[0]} // Format the date to 'YYYY-MM-DD'*/}
        {/*          onChange={e => setEndDate(new Date(e.target.value))}*/}
        {/*        />*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </Card>*/}

        {/*  <div className={'flex flex-col gap-2 justify-between'}>*/}
        {/*    <Button onClick={handleFetchClick} disabled={loading}>*/}
        {/*      {loading ? 'Loading...' : 'Refresh'}*/}
        {/*    </Button>*/}
        {/*    {error && <div>Error fetching data: {error}</div>}*/}
        {/*  </div>*/}

        {/*  {outcomeSummary && (*/}
        {/*    <Card className={'flex-0 ml-auto !bg-primary-bg-subtle'}>*/}
        {/*      <div className={'flex flex-col'}>*/}
        {/*        <div className={'flex flex-row'}>*/}
        {/*          <span className={'font-bold w-20'}>Wins:&nbsp;</span>*/}
        {/*          <span className={'text-[var(--jade-11)] font-bold'}>{outcomeSummary?.successCount}</span>*/}
        {/*        </div>*/}

        {/*        <div className={'flex flex-row'}>*/}
        {/*          <span className={'font-bold w-20'}>Losses:&nbsp;</span>*/}
        {/*          <span className={'text-[var(--tomato-11)] font-bold'}>{outcomeSummary?.failCount}</span>*/}
        {/*        </div>*/}

        {/*        <div className={'flex flex-row'}>*/}
        {/*          <span className={'font-bold w-20'}>Win Rate:&nbsp;</span>*/}
        {/*          <span className={'text-[var(--slate-11)] font-bold'}>*/}
        {/*            {isNaN(outcomeSummary?.winPerc) ? 0 : outcomeSummary?.winPerc.toFixed(1)}%*/}
        {/*          </span>*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </Card>*/}
        {/*  )}*/}
        {/*</div>*/}

        <div className={'flex flex-row w-[100%] flex-auto gap-5'}>
          <div className={'hidden flex flex-col gap-5'}>
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
                            <GearIcon></GearIcon>
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
                                id: trigger.id,
                              });
                              setShowTriggerDialog(true);
                            }}
                          >
                            <GearIcon></GearIcon>
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

                {/*{userOutcome && (*/}
                {/*  <div key={userOutcome.name} className={'flex flex-row items-center gap-3'}>*/}
                {/*    <div className={'flex flex-col flex-auto bg-primary-bg rounded-lg p-2'}>*/}
                {/*      <div className={'flex flex-row gap-5 justify-between'}>*/}
                {/*        <label className={'font-bold'}>{userOutcome.name}</label>*/}

                {/*        <div className={'flex flex-row items-center gap-3'}>*/}
                {/*          <IconButton*/}
                {/*            variant={'ghost'}*/}
                {/*            onClick={() => {*/}
                {/*              setUserOutcome(null);*/}
                {/*              setOutcomeMarkers([]);*/}
                {/*            }}*/}
                {/*          >*/}
                {/*            <TrashIcon color="tomato"></TrashIcon>*/}
                {/*          </IconButton>*/}

                {/*          <IconButton*/}
                {/*            variant={'ghost'}*/}
                {/*            onClick={() => {*/}
                {/*              setCurrentOutcome(userOutcome);*/}
                {/*              setShowOutcomeDialog(true);*/}
                {/*            }}*/}
                {/*          >*/}
                {/*            <GearIcon></GearIcon>*/}
                {/*          </IconButton>*/}
                {/*        </div>*/}
                {/*      </div>*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*)}*/}
              </div>
            </Card>
          </div>

          <div className={'flex flex-col flex-auto w-[100%]'}>
            <div className={'w-full h-[40px] bg-primary-bg justify-between items-center flex px-3'}>
              <div className={'flex flex-row items-center gap-3'}>
                <div className={'flex items-center gap-2'}>
                  <p className="text-xs">From</p>
                  {/*<DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} />*/}
                  {/*Change to use normal html input date*/}
                  <TextFieldInput
                    size="1"
                    type="date"
                    value={startDate.toISOString().split('T')[0]} // Format the date to 'YYYY-MM-DD'
                    onChange={e => setStartDate(new Date(e.target.value))}
                  />
                </div>

                <div className={'flex items-center gap-2'}>
                  <p className="text-xs">To</p>
                  <TextFieldInput
                    size="1"
                    type="date"
                    value={endDate.toISOString().split('T')[0]} // Format the date to 'YYYY-MM-DD'
                    onChange={e => setEndDate(new Date(e.target.value))}
                  />
                </div>
              </div>
              <div className={'invisible'}>Hidden</div>
              <div className={'flex gap-5 items-center'}>
                <div className={'flex flex-row gap-2'}>
                  <Button
                    variant={'soft'}
                    size={'1'}
                    onClick={() => {
                      setShowAddIndicatorDialog(true);
                    }}
                  >
                    <p className="hidden xl:block">Add Indicator</p>
                    <BarChartIcon />
                  </Button>

                  <Button
                    variant={'soft'}
                    size={'1'}
                    onClick={() => {
                      setEditTrigger({
                        display: true,
                        trigger: undefined,
                      });
                    }}
                  >
                    <p className="hidden xl:block">Add Trigger</p>
                    <LightningBoltIcon />
                  </Button>

                  <Button
                    variant={'soft'}
                    disabled={true}
                    size={'1'}
                    onClick={() => {
                      // setShowAddIndicatorDialog(true);
                    }}
                  >
                    <p className="hidden xl:block">Add Outcome</p>
                    <CheckboxIcon />
                  </Button>
                </div>

                <div className={'flex flex-row gap-2 items-center'}>
                  <h3 className="text-sm">Strategy</h3>
                  <Select.Root
                    size={'1'}
                    value={selectedStrategy.id}
                    onValueChange={value => {
                      const selected = strategies.find(s => s.id === value);
                      if (selected) {
                        setSelectedStrategy(selected);
                      }
                    }}
                  >
                    <Select.Trigger placeholder="" className={'!w-[150px]'}></Select.Trigger>
                    <Select.Content>
                      {strategies.map(strategy => (
                        <Select.Item key={strategy.id} value={strategy.id}>
                          {strategy.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>

                  <Popover.Root>
                    <Popover.Trigger>
                      <IconButton
                        size={'1'}
                        variant={'ghost'}
                        className=""
                        onClick={() => {
                          setNewStrategyName(selectedStrategy.name);
                        }}
                      >
                        <Pencil1Icon />
                      </IconButton>
                    </Popover.Trigger>

                    <Popover.Content>
                      <div className={'flex flex-col gap-3'}>
                        <Heading size={'3'}>Edit Strategy</Heading>
                        <TextFieldInput
                          size="1"
                          value={newStrategyName}
                          onChange={e => setNewStrategyName(e.target.value)}
                        />
                        <Popover.Close>
                          <div className={'flex flex-row justify-between'}>
                            <Button
                              size="1"
                              color={'gray'}
                              onClick={() => {
                                setNewStrategyName('');
                              }}
                            >
                              Cancel
                            </Button>

                            <Button
                              size={'1'}
                              onClick={() => {
                                const updatedStrategies = strategies.map(s => {
                                  if (s.id === selectedStrategy.id) {
                                    return {
                                      ...s,
                                      name: newStrategyName,
                                    };
                                  }

                                  return s;
                                });

                                setStrategies(updatedStrategies);
                                saveStrategies(updatedStrategies);
                                setNewStrategyName('');
                              }}
                            >
                              Update
                            </Button>
                          </div>
                        </Popover.Close>
                      </div>
                    </Popover.Content>
                  </Popover.Root>

                  <Popover.Root>
                    <Popover.Trigger>
                      <IconButton size={'1'}>
                        <PlusIcon />
                      </IconButton>
                    </Popover.Trigger>

                    <Popover.Content>
                      <div className={'flex flex-col gap-3'}>
                        <Heading size={'3'}>Strategy Name</Heading>
                        <TextFieldInput
                          size="1"
                          value={newStrategyName}
                          onChange={e => setNewStrategyName(e.target.value)}
                        />
                        <div className={'flex flex-row justify-between'}>
                          <Popover.Close>
                            <>
                              <Button size="1" color={'gray'}>
                                Cancel
                              </Button>

                              <Button
                                size={'1'}
                                onClick={() => {
                                  const newStrategy = generateEmptyStrategy(newStrategyName);

                                  const updatedStrategies = [...strategies, newStrategy];
                                  setStrategies(updatedStrategies);
                                  saveStrategies(updatedStrategies);
                                  setNewStrategyName('');
                                }}
                              >
                                Create
                              </Button>
                            </>
                          </Popover.Close>
                        </div>
                      </div>
                    </Popover.Content>
                  </Popover.Root>
                </div>
              </div>
            </div>
            {bottomTab ? (
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel
                  defaultSize={60}
                  minSize={20}
                  onResize={() => {
                    resizeChart();
                  }}
                  className={'flex flex-col flex-auto w-full'}
                >
                  <ChartPanel />
                </ResizablePanel>
                <ResizableHandle className={'w-full !h-[2px] bg-primary-border'}></ResizableHandle>
                <ResizablePanel defaultSize={40} minSize={20}>
                  <SecondaryPanel />
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <div className={'flex flex-col flex-auto w-[100%]'}>
                <ChartPanel />
                <div className={'w-full h-[2px] bg-primary-border'}></div>
                <SecondaryPanel />
              </div>
            )}

            {/*Chart area*/}
          </div>
        </div>
      </div>
      <AddIndicatorDialog
        show={showAddIndicatorDialog}
        onIndicatorSelected={async (indicator: Indicator) => {
          // Check how many of this indicator type already exist
          const existingIndicators = userIndicators.filter(i => i.tag === indicator.tag);
          const indicatorCount = existingIndicators.length;

          const newIndicator: Indicator = {
            id: uuid(),
            tag: indicatorCount ? `${indicator.tag}${indicatorCount + 1}` : indicator.tag,
            funcStr: indicator.funcStr,
            params: indicator.params,
            label: indicator.label,
            overlay: indicator.overlay,
            streams: indicator.streams,
            // properties: indicator.properties,
            properties: parseFunctionReturnKeys(indicator.funcStr),
          };

          await centralAddIndicator(newIndicator);
          // setUserIndicators([...userIndicators, newIndicator]);
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
        onSaveClicked={async () => {
          const dialogIndicator: Omit<Indicator, 'id'> = {
            tag: currentIndicator.tag,
            funcStr: currentIndicator.funcStr,
            params: currentIndicator.params,
            label: currentIndicator.label,
            overlay: currentIndicator.overlay,
            properties: currentIndicator.properties,
            streams: currentIndicator.streams,
          };

          const index = userIndicators.findIndex(i => i.tag === currentIndicator.tag);

          await centralEditIndicator({
            ...userIndicators[index],
            ...dialogIndicator,
          });

          // if (index !== -1) {
          //   // Update existing indicator
          //   const newIndicators = [...userIndicators];
          //   newIndicators[index] = {
          //     ...newIndicators[index],
          //     ...dialogIndicator,
          //   };
          //
          //   setUserIndicators(newIndicators);
          // }

          setShowEditIndicatorDialog(false);
        }}
        onCancelClicked={() => {
          setShowEditIndicatorDialog(false);
        }}
      />

      <EditIndicatorCodeDialog
        show={showEditIndicatorCodeDialog}
        existingIndicators={userIndicators}
        indicator={editorIndicator}
        // setIndicator={setEditorIndicator}
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

      <UserTriggerDialog
        show={showTriggerDialog}
        trigger={currentTrigger}
        setTrigger={setCurrentTrigger}
        onSaveClicked={() => {
          const updatedTriggers = [...userTriggers];
          const triggerIndex = updatedTriggers.findIndex(t => t.id === currentTrigger.id);

          if (triggerIndex !== -1) {
            // Update existing trigger
            updatedTriggers[triggerIndex] = currentTrigger;
          } else {
            // Add new trigger
            updatedTriggers.push({
              ...currentTrigger,
              id: Date.now().toString(),
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

      <Dialog.Root open={editTrigger.display}>
        <Dialog.Content>
          <EditTrigger
            trigger={editTrigger.trigger}
            saveTrigger={async (trigger: Trigger) => {
              if (editTrigger.trigger) {
                await centralEditTrigger({
                  ...(editTrigger.trigger || {}),
                  ...trigger,
                });
              } else {
                await centralAddTrigger({ ...trigger, enabled: true });
              }

              setEditTrigger({
                display: false,
                trigger: undefined,
              });
            }}
            topRightSlot={
              <IconButton
                variant={'ghost'}
                className={'!rounded-full'}
                size={'1'}
                onClick={() => {
                  setEditTrigger({
                    display: false,
                    trigger: undefined,
                  });
                }}
              >
                <Cross2Icon className="h-6 w-6"></Cross2Icon>
              </IconButton>
            }
            properties={{
              default: DEFAULT_FIELDS,
              indicator: userIndicators.map(i => ({
                indicatorTag: i.tag,
                streamTag: i.streams.map(s => s.tag),
              })),
            }}
            // TODO: DO I need to make operators funcs array based?
            operators={DEFAULT_OPERATORS}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/*<UserOutcomeDialog*/}
      {/*  show={showOutcomeDialog}*/}
      {/*  outcome={currentOutcome}*/}
      {/*  setOutcome={setCurrentOutcome}*/}
      {/*  onSaveClicked={() => {*/}
      {/*    setUserOutcome(currentOutcome);*/}
      {/*    setShowOutcomeDialog(false); // Close the dialog*/}
      {/*  }}*/}
      {/*  onCancelClicked={() => {*/}
      {/*    setCurrentOutcome(DEFAULT_USER_OUTCOME);*/}
      {/*    setShowOutcomeDialog(false);*/}
      {/*  }}*/}
      {/*/>*/}
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

const DEFAULT_USER_TRIGGER: UserTrigger = {
  id: '',
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
  id: '',
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
