'use client';

import { Button, Dialog, IconButton, Slider } from '@radix-ui/themes';
import { BacktestChart } from '@/components/BacktestChart';
import { HISTORICAL_VALUE_COUNT } from '@/app/(logic)/values';
import { PauseIcon, PlayIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { useDisplaySnapshot } from '@/app/display-snapshot-provider';
import { useDisplayMode } from '@/app/display-mode-aware-radix-theme-provider';

export const BacktestSnapshotsDialog = ({ show }: { show: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [candlesPerSecond, setCandlesPerSecond] = useState<number>(1);

  const [displayMode, setDisplayMode] = useDisplayMode();
  const [matchingSnapshots, setMatchingSnapshots] = useDisplaySnapshot();
  const [position, setPosition] = useState<number>(0);

  return (
    <Dialog.Root open={show}>
      <Dialog.Trigger>
        <div>
          <Button className={'ml-auto'}>Replay snapshots</Button>
        </div>
      </Dialog.Trigger>
      <Dialog.Content className={'min-w-[70vw] h-[90vh]'}>
        <div className={'flex flex-col'}>
          <div className={'w-[100%] h-[500px]'}>
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

          <div className={'flex flex-row gap-2 mt-3 justify-center items-center'}>
            <div className={'flex-1'}></div>
            <Button
              onClick={() => {
                if (position > 0) {
                  setPosition(position - 1);
                }
              }}
            >
              Prev setup
            </Button>
            <Button
              onClick={() => {
                if (position < matchingSnapshots.length - 1) {
                  setPosition(position + 1);
                }
              }}
            >
              Next setup
            </Button>
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
      </Dialog.Content>
    </Dialog.Root>
  );
};
