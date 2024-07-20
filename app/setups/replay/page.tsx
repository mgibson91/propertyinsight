'use client';

import { Button, IconButton, Slider } from '@radix-ui/themes';
import { BacktestChart } from '@/components/BacktestChart';
import { HISTORICAL_VALUE_COUNT } from '@/app/(logic)/values';
import { ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { useDisplaySnapshot } from '@/app/display-snapshot-provider';
import { useDisplayMode } from '@/app/display-mode-aware-radix-theme-provider';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function () {
  const [isPlaying, setIsPlaying] = useState(false);
  const [candlesPerSecond, setCandlesPerSecond] = useState<number>(1);

  const [displayMode, setDisplayMode] = useDisplayMode();
  const [displaySnapshots] = useDisplaySnapshot();
  const router = useRouter();

  const searchParams = useSearchParams();
  const urlPositionString = searchParams.get('position');
  const urlPosition = urlPositionString ? parseInt(urlPositionString) : 0;

  const [position, setPosition] = useState<number>(!isNaN(urlPosition) ? urlPosition : 0);

  // const displaySnapshots = origSnapshots.map(snapshot => {
  //   let candlestickData: CandlestickData[] = [];
  //   let userSeriesMap = new Map<string, LineData<Time>[]>();
  //
  //   snapshot.data.forEach(d => {
  //     const { time, open, high, low, close, ...rest } = d;
  //
  //     candlestickData.push({
  //       time: d.time,
  //       open: d.open as number,
  //       high: d.high as number,
  //       low: d.low as number,
  //       close: d.close as number,
  //     });
  //
  //     // Iterate through rest, get array if present, create if not and push value with time
  //     Object.keys(rest).forEach(key => {
  //       if (!userSeriesMap.has(key)) {
  //         userSeriesMap.set(key, []);
  //       }
  //
  //       userSeriesMap.get(key)?.push({ time, value: rest[key] as number });
  //     });
  //   });
  //
  //   const userSeriesData = Array.from(userSeriesMap).map(([key, data]) => {
  //     return {
  //       overlay: false,
  //       color: pickRandom(DARK_COLOR_LIST_10),
  //       lineWidth: 1 as 1 | 2 | 3 | 4,
  //       data,
  //     };
  //   });
  //
  //   const conditionMarker: SeriesMarker<UTCTimestamp> = {
  //     time: snapshot.triggerTimestamp as UTCTimestamp,
  //     position: 'belowBar',
  //     color: displayMode.mode === 'dark' ? '#BDE56C' : '#5C7C2F',
  //     shape: 'arrowUp',
  //     size: 2,
  //   };
  //
  //   const outcomeMarker: SeriesMarker<Time> = {
  //     time: snapshot.outcomeTimestamp as UTCTimestamp,
  //     position: 'belowBar',
  //     color: displayMode.mode === 'dark' ? '#BDE56C' : '#5C7C2F',
  //     shape: 'arrowUp',
  //     size: 2,
  //   };
  //
  //   return {
  //     marker: conditionMarker,
  //     candlestickData,
  //     userSeriesData,
  //     outcomeMarker,
  //     outcomeOffset: snapshot.offsetBetweenTriggerAndOutcome,
  //     historicalCandles: HISTORICAL_VALUE_COUNT,
  //   };
  // });

  if (displaySnapshots.length === 0) {
    return (
      <div className={'w-full h-full items-center justify-center'}>
        <div className={'h-full gap-2 items-center justify-center flex flex-col'}>
          <p>No historical setups available</p>
          <Link href={'/dashboard'}>
            <Button size={'3'}>Configure setups in dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={'flex flex-col w-full h-full gap-3 px-4'}>
      <div className="sticky top-[50px] z-10 backdrop-blur-lg">
        {/*<div className="flex flex-row items-center py-3 justify-between">*/}
        <div className={'flex flex-row items-center py-3 justify-between h-[80px]'}>
          <div className={'flex-1'}></div>
          <div className={'flex flex-row gap-2'}>
            <Button
              variant={'soft'}
              onClick={() => {
                if (position > 0) {
                  setPosition(position - 1);
                  router.push(`/setups/replay?position=${position - 1}`);
                }
              }}
            >
              <ArrowLeftIcon />
              Last setup
            </Button>
            <Button
              variant={'soft'}
              onClick={() => {
                if (position < displaySnapshots.length - 1) {
                  setPosition(position + 1);
                  router.push(`/setups/replay?position=${position + 1}`);
                }
              }}
            >
              Next setup
              <ArrowRightIcon />
            </Button>
          </div>

          <div className={'justify-end flex items-center flex-1'}>
            <div className={'flex flex-row items-center gap-3'}>
              <IconButton
                variant={'soft'}
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>

              <div className={'flex flex-col gap-1 items-center w-[170px]'}>
                <label>{candlesPerSecond} candles / second</label>
                <Slider
                  value={[candlesPerSecond]}
                  max={10}
                  min={1}
                  defaultValue={[1]}
                  onValueChange={value => setCandlesPerSecond(value[0])}
                  className="w-24 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={'w-full flex-1 p-5 pt-0'}>
        <BacktestChart
          autoplay={isPlaying}
          candlesPerSecond={candlesPerSecond}
          displaySnapshot={displaySnapshots[position]}
          futureValueCount={20}
          minDatapointsRequiredForAllSeries={HISTORICAL_VALUE_COUNT}
          color={{
            background: displayMode.mode === 'dark' ? '#18191B' : '#F9F9FB',
            text: displayMode.mode === 'dark' ? '#B0B4BA' : '#60646C',
            gridLines: displayMode.mode === 'dark' ? '#696E77' : '#8B8D98',
            scale: displayMode.mode === 'dark' ? '#5A6169' : '#B9BBC6',
          }}
        />
      </div>
    </div>
  );
}
