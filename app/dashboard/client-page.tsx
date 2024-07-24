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
  TextField,
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
import { useDisplaySnapshot } from '@/app/display-snapshot-provider';
import { useDisplayMode } from '@/app/display-mode-aware-radix-theme-provider';
// import { getConsolidatedSeries } from '@/app/(logic)/get-consolidated-series';
import { GenericData, UserOutcome, UserSeries, UserSeriesData, UserTrigger } from '@/app/(logic)/types';
import { EditIndicatorDialog } from '@/components/edit-indicator-dialog';
import { generateSmaPreset, PRESET_INDICATOR_EMA, PRESET_INDICATOR_SMA } from '@/logic/indicators/preset-indicator';
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
import { getConsolidatedSeriesNew } from '@/logic/get-consolidated-series-new';
import * as z from 'zod';
import { Indicator, IndicatorSchema, IndicatorTag } from '@/logic/indicators/types';
import { parseFunctionReturnKeys } from '@/app/(logic)/parse-function-return-key';
import { DEFAULT_OPERATORS, EditTrigger, Trigger } from '@/components/triggers/edit-trigger';
import { DEFAULT_FIELDS } from '@/app/(logic)/get-indicator-stream-tags';
import { calculateTriggerEvents } from '@/logic/triggers/calculate-trigger-events';
import { EditOutcome } from '@/components/triggers/edit-outcome';
import { calculateOutcomeEvents, OutcomeEvent } from '@/logic/outcomes/calculate-outcome-events';
import { OutcomeConfig } from '@/logic/outcomes/types';
import { calculateOutcomeSummary } from '@/logic/outcomes/calculate-outcome-summary';
import { getTickerStreamData } from '@/repository/ticker_stream_data/get-ticker-stream-data';
import { TickerStreamModel } from '@/repository/ticker_stream_data/get-ticker-streams';
import { getMatchingSnapshots } from '@/logic/snapshots/get-matching-snapshots';
import { FUTURE_VALUE_COUNT, HISTORICAL_VALUE_COUNT } from '@/app/(logic)/values';
import { buildDisplaySnapshot } from '@/logic/snapshots/build-display-snapshot';
import { buildStreamTagIndicatorMap } from '@/app/(logic)/resolve-all-indicator-stream-tags';

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
  console.log('Saving strategies', strategies);
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

// const TICKER_STREAMS = [
//   {
//     id: '79cd3a48-4cb0-4bdf-80e7-d671200be0fd',
//     source: 'binance',
//     ticker: 'BTCUSDT',
//     period: '1h',
//   },
//   {
//     id: '6c55c8d5-d4fb-4199-a67d-a3de3655f7f8',
//     source: 'binance',
//     ticker: 'SOLUSDT',
//     period: '1h',
//   },
//   {
//     id: '85749a89-aa58-4a40-82b3-4a48e4f18734',
//     source: 'binance',
//     ticker: 'AVAXUSDT',
//     period: '1h',
//   },
//   {
//     id: '667b33fb-2aa1-4697-b1b9-50ece1f05405',
//     source: 'binance',
//     ticker: 'TRXUSDT',
//     period: '1h',
//   },
//   {
//     id: 'ee78ceaf-e5c6-4618-9aed-220cde4f4c58',
//     source: 'binance',
//     ticker: 'XRPUSDT',
//     period: '1h',
//   },
// ];

const ClientPage = ({ streams }: { streams: TickerStreamModel[] }) => {
  const chartRef = useRef(null);
  const [ticker, setTicker] = useState('BTCUSD');
  const [timeframe, setTimeframe] = useState('1h');
  const [startDate, setStartDate] = useState(
    // new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
    new Date('2024-06-01')
    // new Date('2023-12-11')
  );
  const [endDate, setEndDate] = useState(new Date('2024-06-30'));
  // const [endDate, setEndDate] = useState(new Date('2023-12-13'));
  const [tickerStream, setTickerStream] = useState(streams[0]);
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
  const [userIndicators, setUserIndicators] = useState<Array<Indicator>>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [outcomeConfigs, setOutcomeConfigs] = useState<OutcomeConfig[]>([]);

  const [triggerMarkers, setTriggerMarkers] = useState<SeriesMarker<UTCTimestamp>[]>([]);
  const [outcomeMarkers, setOutcomeMarkers] = useState<SeriesMarker<UTCTimestamp>[]>([]);
  const [outcomeEvents, setOutcomeEvents] = useState<OutcomeEvent[]>([]);

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

  const [displaySnapshots, setDisplaySnapshots] = useDisplaySnapshot();

  const [displayMode] = useDisplayMode();

  const [tabResetKey, setTabResetKey] = useState<number>(0);

  // We display
  const [bottomTab, setBottomTab] = useState<'editor' | 'strategy' | undefined>('editor');

  const [outcomeSummary, setOutcomeSummary] = useState<{
    successCount: number;
    failCount: number;
    winPerc: number;
  } | null>(null);

  // TODO: Make this dialog indicator
  const [currentIndicator, setCurrentIndicator] = useState<Indicator>(DEFAULT_INDICATOR);
  const [editorIndicator, setEditorIndicator] = useState<Indicator | undefined>(undefined);
  const [showAddIndicatorDialog, setShowAddIndicatorDialog] = useState(false);
  const [editTrigger, setEditTrigger] = useState<{
    trigger?: Trigger;
    display: boolean;
  }>({
    trigger: undefined,
    display: false,
  });
  const [editOutcome, setEditOutcome] = useState<{
    outcome?: OutcomeConfig;
    display: boolean;
  }>({
    outcome: undefined,
    display: false,
  });
  const [showEditIndicatorDialog, setShowEditIndicatorDialog] = useState(false);
  const [showEditIndicatorCodeDialog, setShowEditIndicatorCodeDialog] = useState(false);

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
      setUserIndicators(activeStrategy.indicators as Indicator[]);
      setTriggers(activeStrategy.triggers);
      setOutcomeConfigs(activeStrategy.outcomes);

      // Set local yokes for speed
      // setUserIndicators(activeStrategy.indicators);
    };

    asyncLoadStrategies();
  }, []);

  const centralDelete = async <T extends { id: string | number }>(
    entityType: 'indicator' | 'trigger' | 'outcome',
    entities: T[],
    filterFunction: (entity: T) => boolean
  ) => {
    let updatedEntities: T[];

    updatedEntities = entities.filter(filterFunction);

    // Local updates for rapidity
    switch (entityType) {
      case 'indicator':
        setUserIndicators(updatedEntities as unknown as Indicator[]);
        break;
      case 'trigger':
        setTriggers(updatedEntities as unknown as Trigger[]);
        break;
      case 'outcome':
        setOutcomeConfigs(updatedEntities as unknown as OutcomeConfig[]);
        break;
      default:
        throw new Error('Invalid entity type');
    }

    const newStrategies = strategies.map(strategy => {
      if (strategy.id === selectedStrategy.id) {
        return {
          ...strategy,
          ...(entityType === 'indicator' ? { indicators: updatedEntities } : {}),
          ...(entityType === 'trigger' ? { triggers: updatedEntities } : {}),
          ...(entityType === 'outcome' ? { outcomes: updatedEntities } : {}),
        };
      }

      return strategy;
    });

    // Save to strategy
    await saveStrategies(newStrategies as any);
  };

  // Define a generic function to update strategy
  const centralUpdateStrategy = async <T extends { id: string | number }>(
    entityType: 'indicator' | 'trigger' | 'outcome',
    entities: T[],
    newEntity: T | Partial<T>,
    updateType: 'add' | 'edit' | 'delete'
  ) => {
    let updatedEntities: T[];

    switch (updateType) {
      case 'add':
        updatedEntities = [...entities, newEntity as T];
        break;
      case 'edit':
        updatedEntities = entities.map(e => (e.id === (newEntity as T).id ? (newEntity as T) : e));
        break;
      default:
        throw new Error('Invalid update type');
    }

    // Local updates for rapidity
    switch (entityType) {
      case 'indicator':
        setUserIndicators(updatedEntities as unknown as Indicator[]);
        break;
      case 'trigger':
        setTriggers(updatedEntities as unknown as Trigger[]);
        break;
      case 'outcome':
        setOutcomeConfigs(updatedEntities as unknown as OutcomeConfig[]);
        break;
      default:
        throw new Error('Invalid entity type');
    }

    const newStrategies = strategies.map(strategy => {
      if (strategy.id === selectedStrategy.id) {
        return {
          ...strategy,
          [entityType + 's']: updatedEntities,
        };
      }

      return strategy;
    });

    // Save to strategy
    await saveStrategies(newStrategies);
    setStrategies(newStrategies);
  };

  // // Specific functions for each entity type
  const centralAddIndicator = async (indicator: Indicator) =>
    centralUpdateStrategy('indicator', userIndicators, indicator, 'add');
  const centralEditIndicator = async (indicator: Indicator) =>
    centralUpdateStrategy('indicator', userIndicators, indicator, 'edit');
  const centralDeleteIndicator = async (tag: string) => centralDelete('indicator', userIndicators, i => i.tag !== tag);

  const centralAddTrigger = async (trigger: Trigger) => centralUpdateStrategy('trigger', triggers, trigger, 'add');
  const centralEditTrigger = async (trigger: Trigger) => centralUpdateStrategy('trigger', triggers, trigger, 'edit');
  const centralDeleteTrigger = async (id: string) => centralDelete('trigger', triggers, t => t.id !== id);

  const centralAddOutcome = async (outcome: OutcomeConfig) =>
    centralUpdateStrategy('outcome', outcomeConfigs, outcome, 'add');
  const centralEditOutcome = async (outcome: OutcomeConfig) =>
    centralUpdateStrategy('outcome', outcomeConfigs, outcome, 'edit');
  const centralDeleteOutcome = async (id: string) => centralDelete('outcome', outcomeConfigs, o => o.id !== id);

  const resizeChart = useDebounceCallback(() => {
    if (chartRef.current) {
      (chartRef.current as any).resize();
    }
  }, 200);

  useEffect(() => {
    const newIndicatorData = convertStreamsToChartSeries(indicatorSeriesMap, userIndicators);
    setUserIndicatorData(newIndicatorData);
  }, [indicatorSeriesMap, userIndicators]);

  useEffect(() => {
    (async () => {
      const strategies = await loadStrategies();

      const strategy = strategies.find(strategy => strategy.id === selectedStrategy.id);

      if (strategy) {
        setUserIndicators((strategy?.indicators as Indicator[]) || []);
        setTriggers(strategy?.triggers || []);
        setOutcomeConfigs(strategy?.outcomes || []);
      }
    })();
  }, [selectedStrategy]);

  useEffect(() => {
    handleFetchClick();
  }, [tickerStream, streams, timeframe, startDate, endDate, userSeries, triggers, outcomeConfigs, userIndicators]);

  const handleFetchClick = async () => {
    setLoading(true);
    setError(null);
    try {
      // const rawData = await fetchCandlesFromMemory(ticker, timeframe, startDate.getTime(), endDate.getTime());
      const rawData = await getTickerStreamData({
        source: tickerStream.source,
        ticker: tickerStream.ticker,
        period: tickerStream.period,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      });

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

      const streamTagIndicatorMap = buildStreamTagIndicatorMap(userIndicators);

      const triggerEvents = calculateTriggerEvents({
        data: consolidatedSeries.data,
        triggers,
        delayMap: consolidatedSeries.delayMap,
        streams: consolidatedSeries.streams,
        streamTagIndicatorMap,
      });

      // Convert trigger markers to chart
      const newTriggerMarkers: SeriesMarker<UTCTimestamp>[] = Object.entries(triggerEvents).flatMap(
        ([triggerId, events]) => {
          const triggerName = triggers.find(trigger => trigger.id === triggerId)?.name || triggerId;

          return events.map(({ time, occurrence }) => {
            return {
              time,
              text: `${triggerName} ${occurrence}`,
              position: 'belowBar',
              color: displayMode.mode === 'dark' ? '#BDE56C' : '#5C7C2F',
              shape: 'arrowUp',
              size: 2,
            };
          });
        }
      );

      setTriggerMarkers(newTriggerMarkers);

      const outcomeEvents = calculateOutcomeEvents({
        data: consolidatedSeries.data,
        outcomeConfigs,
        streams: consolidatedSeries.streams,
        triggerEvents,
      });

      setOutcomeEvents(outcomeEvents);

      const newOutcomeMarkers: SeriesMarker<UTCTimestamp>[] = outcomeEvents.map(({ outcome, trigger }) => {
        const triggerName = triggers.find(t => trigger.id === t.id)?.name || '';

        return {
          time: outcome.time,
          position: 'belowBar',
          color: outcome.delta > 0 ? '#1FD8A4' : '#FF977D',
          shape: outcome.delta > 0 ? 'arrowUp' : 'arrowDown',
          size: 2,
          text: `${triggerName} ${trigger.occurrence} (${outcome.percDelta.toFixed(2)}%)`,
        };
      });

      setOutcomeMarkers(newOutcomeMarkers);

      const summary = calculateOutcomeSummary(outcomeEvents);

      setOutcomeSummary({
        failCount: summary.failCount,
        successCount: summary.successCount,
        winPerc: (summary.successCount / (summary.successCount + summary.failCount)) * 100,
      });

      const matchingSnapshots = getMatchingSnapshots({
        data: consolidatedSeries.data,
        outcomeEvents,
        historicalValues: HISTORICAL_VALUE_COUNT,
        futureValues: FUTURE_VALUE_COUNT,
      });

      const displaySnapshots = matchingSnapshots.map(snapshot =>
        buildDisplaySnapshot(snapshot, displayMode.mode, streamTagIndicatorMap)
      );

      // Given

      setDisplaySnapshots(displaySnapshots);

      // TODO: Marker snapshots
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
                      }}
                    >
                      <Cross1Icon color="tomato"></Cross1Icon>
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {outcomeConfigs.map(outcome => (
            <div key={outcome.name} className={'flex flex-row items-center gap-3'}>
              <div
                className={
                  'flex flex-col flex-auto bg-transparent hover:bg-primary-bg hover:ring-[1px] hover:ring-inset hover:ring-primary-border p-1 rounded-md'
                }
              >
                <div className={'flex flex-row gap-3 justify-between group'}>
                  <div className={'flex flex-row items-center gap-2'}>
                    <CheckboxIcon className={'w-3 h-3'} />
                    <label className={'font-medium text-sm'}>{outcome.name}</label>
                  </div>
                  <div className={'flex-row items-center gap-2 hidden group-hover:flex'}>
                    <div className={'flex flex-row items-center gap-2'}>
                      <IconButton
                        variant={'ghost'}
                        size={'1'}
                        onClick={() => {
                          // TODO: Central edit outcome
                          const newOutcomes = outcomeConfigs.map(t => {
                            if (t.name === outcome.name) {
                              return {
                                ...t,
                                enabled: !t.enabled,
                              };
                            }

                            return t;
                          });

                          setOutcomeConfigs(newOutcomes);
                        }}
                      >
                        {outcome.enabled ? <EyeOpenIcon /> : <EyeNoneIcon />}
                      </IconButton>
                    </div>

                    {/*TODO: View and edit code - override if edited*/}
                    <IconButton
                      color={'gray'}
                      variant={'ghost'}
                      size={'1'}
                      onClick={() => {
                        // TODO: Outcome code edit
                        setEditOutcome({
                          outcome,
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
                        setEditOutcome({
                          outcome,
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
                        await centralDeleteOutcome(outcome.id);
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
          // ref={chartRef}
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
        className="w-full flex flex-col flex-1 h-full"
        value={bottomTab}
        onFocus={() => {
          // Need as first setBottomTab from non resizable panel wasn't setting value
          if (!bottomTab) {
            setBottomTab('editor');
          }
        }}
      >
        <div className={'flex flex-row justify-between bg-primary-bg min-h-[40px]'}>
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
              value="strategy"
              onClick={() => {
                if (bottomTab === 'strategy') {
                  setBottomTab(null as any);
                } else {
                  setBottomTab('strategy');
                }
              }}
            >
              Strategy Performance
            </TabsTrigger>
          </TabsList>

          {outcomeSummary && (
            <div className={'flex flex-row items-center !mr-3'}>
              <div className={'flex flex-row gap-2'}>
                <span className={''}>
                  Win Rate&nbsp; <b>{isNaN(outcomeSummary?.winPerc) ? 0 : outcomeSummary?.winPerc.toFixed(1)}%</b>
                </span>
                <div className={'flex flex-row items-center'}>
                  <span className={'text-[var(--jade-11)] '}>{outcomeSummary?.successCount}</span>
                  <span className={''}>:</span>
                  <span className={'text-[var(--tomato-11)] '}>{outcomeSummary?.failCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <TabsContent value="editor">
          <EditorTab
            existingIndicators={userIndicators}
            indicator={editorIndicator}
            onSaveToChartClicked={async partialIndicator => {
              const { tag, label, funcStr, params, streams, properties } = partialIndicator;
              const index = userIndicators.findIndex(i => i.tag === tag);

              if (index !== -1) {
                await centralEditIndicator({
                  ...userIndicators[index],
                  ...partialIndicator,
                });
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
        <TabsContent value="strategy" className="h-full">
          <StrategiesTab outcomeEvents={outcomeEvents} />
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <>
      <div className={'flex-auto flex flex-col w-[100vw]'}>
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
                            onClick={async () => {
                              const index = userIndicators.findIndex(i => i.tag === indicator.tag);
                              const newIndicators = [...userIndicators];
                              newIndicators.splice(index, 1);
                              setUserIndicators(newIndicators);

                              await centralDeleteIndicator(indicator.tag);
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
          </div>

          <div className={'flex flex-col flex-auto w-[100%]'}>
            <div className={'w-full min-h-[40px] bg-primary-bg justify-between items-center flex px-3'}>
              <div className={'flex flex-row items-center gap-3'}>
                <div className={'flex flex-row items-center gap-2'}>
                  <p className="text-xs">Source</p>
                  <Select.Root
                    size={'1'}
                    value={tickerStream.id}
                    onValueChange={value => {
                      const selected = streams.find(s => s.id === value);
                      if (selected) {
                        setTickerStream(selected);
                      }
                    }}
                  >
                    <Select.Trigger className={'!w-[100px]'} />
                    <Select.Content>
                      {streams.map(stream => (
                        <Select.Item key={stream.id} value={stream.id}>
                          {stream.ticker}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </div>

                <div className={'flex items-center gap-2'}>
                  <p className="text-xs">From</p>
                  {/*<DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} />*/}
                  {/*Change to use normal html input date*/}
                  <TextField.Root
                    size="1"
                    type="date"
                    value={startDate.toISOString().split('T')[0]} // Format the date to 'YYYY-MM-DD'
                    onChange={e => setStartDate(new Date(e.target.value))}
                  />
                </div>

                <div className={'flex items-center gap-2'}>
                  <p className="text-xs">To</p>
                  <TextField.Root
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
                    <p className="hidden xl:block">Add Entry</p>
                    <LightningBoltIcon />
                  </Button>

                  <Button
                    variant={'soft'}
                    size={'1'}
                    onClick={() => {
                      setEditOutcome({
                        display: true,
                        outcome: undefined,
                      });
                    }}
                  >
                    <p className="hidden xl:block">Add Exit</p>
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
                        <TextField.Root
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
                        <TextField.Root
                          size="1"
                          value={newStrategyName}
                          onChange={e => setNewStrategyName(e.target.value)}
                        />
                        <div className={'flex flex-row justify-between'}>
                          <>
                            <Popover.Close>
                              <Button size="1" color={'gray'}>
                                Cancel
                              </Button>
                            </Popover.Close>

                            <Popover.Close>
                              <Button
                                size={'1'}
                                onClick={() => {
                                  const newStrategy = generateEmptyStrategy(newStrategyName);
                                  setSelectedStrategy(newStrategy);

                                  const updatedStrategies = [...strategies, newStrategy];
                                  setStrategies(updatedStrategies);
                                  saveStrategies(updatedStrategies);
                                  setNewStrategyName('');
                                }}
                              >
                                Create
                              </Button>
                            </Popover.Close>
                          </>
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
                <div className="max-h-[40px]">
                  <SecondaryPanel />
                </div>
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
            tag: (indicatorCount ? `${indicator.tag}${indicatorCount + 1}` : indicator.tag) as IndicatorTag,
            funcStr: indicator.funcStr,
            params: indicator.params,
            label: indicator.label,
            overlay: indicator.overlay,
            streams: indicator.streams,
            properties: parseFunctionReturnKeys(indicator.funcStr),
          };

          await centralAddIndicator(newIndicator);
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

      {/*Same edit trigger but for outcome*/}
      <Dialog.Root open={editOutcome.display}>
        <Dialog.Content>
          <EditOutcome
            outcome={editOutcome.outcome}
            saveOutcome={async (outcome: OutcomeConfig) => {
              if (editOutcome.outcome) {
                await centralEditOutcome({
                  ...(editOutcome.outcome || {}),
                  ...outcome,
                });
              } else {
                await centralAddOutcome({ ...outcome, enabled: true });
              }

              setEditOutcome({
                display: false,
                outcome: undefined,
              });
            }}
            topRightSlot={
              <IconButton
                variant={'ghost'}
                className={'!rounded-full'}
                size={'1'}
                onClick={() => {
                  setEditOutcome({
                    display: false,
                    outcome: undefined,
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
    </>
  );
};

export default ClientPage;

const DEFAULT_INDICATOR: Indicator = PRESET_INDICATOR_SMA;

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
