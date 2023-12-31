'use client';

import { MatchingSnapshot, useMatchingSnapshot } from '@/app/matching-snapshot-provider';
import { BacktestChart } from '@/components/BacktestChart';
import { Button, Card, IconButton, Slider, Tooltip } from '@radix-ui/themes';
import { useDisplayMode } from '@/app/display-mode-aware-radix-theme-provider';
import { HISTORICAL_VALUE_COUNT } from '@/app/(logic)/values';
import { PauseIcon, PlayIcon, TimerIcon } from '@radix-ui/react-icons';
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SnapshotPage() {
  const [matchingSnapshots, setMatchingSnapshots] = useMatchingSnapshot();
  const [displayMode, setDisplayMode] = useDisplayMode();
  const router = useRouter();

  const [globalIsPlaying, setGlobalIsPlaying] = useState(false);
  const [globalCandlesPerSecond, setGlobalCandlesPerSecond] = useState<number>(1);

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
    <div className="w-full px-4">
      <div className="sticky top-0 z-10 backdrop-blur-lg" >
        <div className="flex flex-row items-center py-3 justify-between h-[80px]">
            {/*<h1 className="text-3xl font-bold underline mb-4">Snapshot Page</h1>*/}
            <h1 className="text-xl">Total Snapshots: {matchingSnapshots.length}</h1>

            <div className={'flex flex-row items-center gap-3'}>
              <IconButton
                variant={'soft'}
                onClick={() => setGlobalIsPlaying(!globalIsPlaying)}
                aria-label={globalIsPlaying ? 'Pause' : 'Play'}
              >
                {globalIsPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>

              <div className={'flex flex-col gap-1 items-center w-[170px]'}>
                <label>{globalCandlesPerSecond} candles / second</label>
                <Slider
                  value={[globalCandlesPerSecond]}
                  max={10}
                  min={1}
                  defaultValue={[1]}
                  onValueChange={value => setGlobalCandlesPerSecond(value[0])}
                  className="w-24 cursor-pointer"
                />
              </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
        {matchingSnapshots.map((snapshot, index) => (
          <Card className={'h-[300px] !bg-primary-bg-subtle'}>
            <div className={'h-full pt-8 relative'}>
              <div className={'absolute top-0 right-0 w-full z-10 flex justify-end'}>
                <Tooltip content={'Replay'} delayDuration={100}>
                  <IconButton onClick={() => router.push(`/setups/replay?position=${index}`)}>
                    <TimerIcon className={'h-5 w-5'}></TimerIcon>
                  </IconButton>
                </Tooltip>
              </div>
              <BacktestChart
                key={index} // Replace 'index' with a unique identifier if available
                autoplay={globalIsPlaying}
                candlesPerSecond={globalCandlesPerSecond}
                candlestickData={snapshot.candlestickData}
                userSeriesData={snapshot.userSeriesData}
                conditionMarker={snapshot.marker}
                outcome={snapshot.outcome ? snapshot.outcome : undefined}
                futureValueCount={snapshot.historicalCandles}
                minDatapointsRequiredForAllSeries={HISTORICAL_VALUE_COUNT}
                color={{
                  background: displayMode.mode === 'dark' ? '#18191B' : '#F9F9FB',

                  text: displayMode.mode === 'dark' ? '#B0B4BA' : '#60646C',
                  // gridLines: displayMode.mode === 'dark' ? '#696E77' : '#8B8D98',
                  gridLines: '#0000',
                  scale: displayMode.mode === 'dark' ? '#5A6169' : '#B9BBC6',
                }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
