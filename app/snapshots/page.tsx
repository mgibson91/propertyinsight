'use client';

import { useMatchingSnapshot } from "@/app/matching-snapshot-provider";
import { BacktestChart } from "@/components/BacktestChart";
import { Card } from "@radix-ui/themes";
import { useDisplayMode } from "@/app/display-mode-aware-radix-theme-provider";
import { HISTORICAL_VALUE_COUNT } from "@/app/(logic)/values";

export default function SnapshotPage() {
  const [matchingSnapshots, setMatchingSnapshots] = useMatchingSnapshot();
  const [displayMode, setDisplayMode] = useDisplayMode();

  return (
    <div className="w-full px-4">
      <div className="sticky top-0 z-10 backdrop-blur-lg">
        <div className="flex flex-row">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold underline mb-4">Snapshot Page</h1>
            <h1 className="text-xl mb-4">Total Snapshots: {matchingSnapshots.length}</h1>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
        {matchingSnapshots.map((snapshot, index) => (
          <Card className={'h-[300px] !bg-primary-bg-subtle'}>
            <div className={'h-full'}>
              <BacktestChart
                key={index} // Replace 'index' with a unique identifier if available
                autoplay={false}
                candlestickData={snapshot.candlestickData}
                userSeriesData={snapshot.userSeriesData}
                conditionMarker={snapshot.marker}
                outcome={snapshot.outcome ? snapshot.outcome : undefined}
                futureValueCount={snapshot.historicalCandles}
                minDatapointsRequiredForAllSeries={HISTORICAL_VALUE_COUNT}
                color={{
                  background: displayMode.mode === 'dark' ? '#18191B' : '#F9F9FB',

                  text: displayMode.mode === 'dark' ? '#B0B4BA' : '#60646C',
                  gridLines: displayMode.mode === 'dark' ? '#696E77' : '#8B8D98',
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
