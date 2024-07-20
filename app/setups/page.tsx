'use client';

import { useDisplaySnapshot } from '@/app/display-snapshot-provider';
import { BacktestChart } from '@/components/BacktestChart';
import { Button, Card, Dialog, Heading, IconButton, Slider, TextFieldInput, Tooltip } from '@radix-ui/themes';
import { useDisplayMode } from '@/app/display-mode-aware-radix-theme-provider';
import { HISTORICAL_VALUE_COUNT } from '@/app/(logic)/values';
import { BellIcon, Cross2Icon, DownloadIcon, PauseIcon, PlayIcon, TimerIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import { CSVLink } from 'react-csv';
import { CandlestickData, LineData, SeriesMarker, Time, UTCTimestamp } from 'lightweight-charts';
import { GenericData } from '@/app/(logic)/types';
import { getRandomValues } from 'node:crypto';
import { DARK_COLOR_LIST_10, pickRandom } from '@/shared/color-lists';
import { MatchingSnapshot } from '@/logic/snapshots/get-matching-snapshots';
import { buildDisplaySnapshot } from '@/logic/snapshots/build-display-snapshot';
// import { prepareCsvContent } from '@/app/(logic)/prepare-csv-content';

export default function SnapshotPage() {
  const [displaySnapshots] = useDisplaySnapshot();
  const [precedingSamples, setPrecedingSamples] = useState<number>(5);
  const [displayMode, setDisplayMode] = useDisplayMode();
  const router = useRouter();

  const [globalIsPlaying, setGlobalIsPlaying] = useState(false);
  const [globalCandlesPerSecond, setGlobalCandlesPerSecond] = useState<number>(1);

  if (displaySnapshots.length === 0) {
    return (
      <div className={'w-full h-full items-center justify-center'}>
        <div className={'h-full gap-2 items-center justify-center flex flex-col'}>
          <p>No historical setups available</p>
          <Link href={'/'}>
            <Button size={'3'}>Configure setups in dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4">
      <div className="sticky top-[50px] z-10 backdrop-blur-lg">
        <div className="flex flex-row items-center py-3 justify-between h-[80px]">
          <div className={'flex flex-row gap-3'}>
            <h1 className="text-xl">Total Snapshots: {displaySnapshots.length}</h1>

            <Dialog.Root>
              <Dialog.Trigger className={'flex flex-row gap-2 items-center'}>
                <Button variant={'soft'}>
                  Download CSV
                  <DownloadIcon></DownloadIcon>
                </Button>
              </Dialog.Trigger>

              <Dialog.Content className={'!max-w-[350px]'}>
                <div className="justify-center items-center h-full w-full">
                  <div className={'flex flex-col gap-3'}>
                    <div className={'flex flex-row justify-between items-center'}>
                      <Heading size={'3'}>Coming soon</Heading>
                      <Dialog.Close>
                        <IconButton color={'gray'} variant={'ghost'}>
                          <Cross2Icon />
                        </IconButton>
                      </Dialog.Close>
                    </div>
                    <div className="gap-2 flex items-center justify-center">
                      <p className="text-2xl">🚧</p>
                    </div>

                    <Button variant={'soft'}>
                      Keep me informed
                      <BellIcon />
                    </Button>
                  </div>
                </div>
                {/*<div className={'flex flex-col gap-4'}>*/}
                {/*  <Heading>Download matching setups</Heading>*/}

                {/*  <div className={'flex flex-col'}>*/}
                {/*    <label>Number of preceding values</label>*/}
                {/*    <TextFieldInput*/}
                {/*      type={'number'}*/}
                {/*      value={precedingSamples}*/}
                {/*      onChange={e => setPrecedingSamples(parseInt(e.currentTarget.value))}*/}
                {/*    ></TextFieldInput>*/}
                {/*  </div>*/}

                {/*  <CSVLink*/}
                {/*    className={'self-center mt-2'}*/}
                {/*    data={prepareCsvContent(displaySnapshots, precedingSamples)}*/}
                {/*    filename={'my-file.csv'}*/}
                {/*    target="_blank"*/}
                {/*  >*/}
                {/*    <Button size={'3'}>*/}
                {/*      Download CSV*/}
                {/*      <DownloadIcon></DownloadIcon>*/}
                {/*    </Button>*/}
                {/*  </CSVLink>*/}
                {/*</div>*/}
              </Dialog.Content>
            </Dialog.Root>
          </div>

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
        {displaySnapshots.map((displaySnapshot, index) => {
          return (
            <Card className={'h-[300px] !bg-primary-bg-subtle'}>
              <div className={'h-full pt-8 relative'}>
                <div className={'absolute top-0 left-0 w-full z-10 flex justify-start'}>
                  <Tooltip content={'Replay'} delayDuration={100}>
                    <IconButton variant={'soft'} onClick={() => router.push(`/setups/replay?position=${index}`)}>
                      <TimerIcon className={'h-5 w-5'}></TimerIcon>
                    </IconButton>
                  </Tooltip>
                </div>
                <BacktestChart
                  key={index} // Replace 'index' with a unique identifier if available
                  autoplay={globalIsPlaying}
                  candlesPerSecond={globalCandlesPerSecond}
                  displaySnapshot={displaySnapshot}
                  futureValueCount={20}
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
          );
        })}
      </div>
    </div>
  );
}
