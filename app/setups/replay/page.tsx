'use client';

import { Button, Dialog, IconButton, Slider } from '@radix-ui/themes';
import { BacktestChart } from '@/components/BacktestChart';
import { HISTORICAL_VALUE_COUNT } from '@/app/(logic)/values';
import { PauseIcon, PlayIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { MatchingSnapshot, useMatchingSnapshot } from '@/app/matching-snapshot-provider';
import { useDisplayMode } from '@/app/display-mode-aware-radix-theme-provider';
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function () {
  const [isPlaying, setIsPlaying] = useState(false);
  const [candlesPerSecond, setCandlesPerSecond] = useState<number>(1);

  const [displayMode, setDisplayMode] = useDisplayMode();
  const [origSnapshots, setMatchingSnapshots] = useMatchingSnapshot();
  const router = useRouter();

  const searchParams = useSearchParams()
  const urlPositionString = searchParams.get('position');
  const urlPosition = urlPositionString ? parseInt(urlPositionString) : 0;

  const [position, setPosition] = useState<number>(!isNaN(urlPosition) ? urlPosition : 0);

  const matchingSnapshots = origSnapshots.map(snapshot => ({
    ...snapshot,
    marker: {
      ...snapshot.marker,
      color: (displayMode.mode ==='dark' ? '#D4FF70' : '#8DB654')
    },
    outcome: snapshot.outcome?.outcomeDetails ? {
      ...snapshot.outcome,
      marker: {
        ...snapshot.outcome.marker,
        color: (snapshot.outcome.marker.shape === 'arrowUp' ? (displayMode.mode ==='dark' ? '#1FD8A4' : '#208368') : (displayMode.mode ==='dark' ? '#FF977D' : '#D13415')),
      }
    } : undefined
  } as MatchingSnapshot));

  if (matchingSnapshots.length === 0) {
    return <div className={'w-full h-full items-center justify-center'}>
        <div className={'h-full gap-2 items-center justify-center flex flex-col'}>
          <p>No historical setups available</p>
          <Link href={'/'}>
            <Button size={'3'}>Configure setups in dashboard</Button>
          </Link>
        </div>
    </div>
  }

  return (
    <div className={'flex flex-col w-full h-full gap-3 px-4'}>
      <div className="sticky top-0 z-10 backdrop-blur-lg">
        {/*<div className="flex flex-row items-center py-3 justify-between">*/}
        <div className={'flex flex-row items-center py-3 justify-between h-[80px]'}>
          <div className={'flex-1'}></div>
          <div className={'flex flex-row gap-2'}>
            <Button
              onClick={() => {
                if (position > 0) {
                  setPosition(position - 1);
                  router.push(`/setups/replay?position=${position - 1}`);
                }
              }}
            >
              Prev setup
            </Button>
            <Button
              onClick={() => {
                if (position < matchingSnapshots.length - 1) {
                  setPosition(position + 1);
                  router.push(`/setups/replay?position=${position + 1}`);
                }
              }}
            >
              Next setup
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
          userSeriesData={matchingSnapshots[position].userSeriesData}
          candlestickData={matchingSnapshots[position].candlestickData}
          conditionMarker={matchingSnapshots[position].marker}
          outcome={
            matchingSnapshots[position].outcome
              ? {
                  marker: matchingSnapshots[position].outcome!.marker,
                  outcomeDetails: matchingSnapshots[position].outcome!.outcomeDetails,
                }
              : undefined
          }
          futureValueCount={matchingSnapshots[position].historicalCandles}
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
