'use client';

import { useMatchingSnapshot } from "@/app/matching-snapshot-provider";
import { BacktestChart } from "@/components/BacktestChart";
import { HISTORICAL_VALUE_COUNT } from "@/app/page";
import { Card } from "@radix-ui/themes";

export default function SnapshotPage() {
  const [matchingSnapshots, setMatchingSnapshots] = useMatchingSnapshot();

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
                  background: "#18191B",
                }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
