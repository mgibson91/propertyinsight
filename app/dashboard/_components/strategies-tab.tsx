import { Indicator } from '@/logic/indicators/types';
import { UserOutcome, UserTrigger } from '@/app/(logic)/types';
import React, { useEffect, useState } from 'react';
import { Button, Heading, TextField } from '@radix-ui/themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Strategy } from '@/app/dashboard/types';
import { OutcomeEvent } from '@/logic/outcomes/calculate-outcome-events';
import luxon, { DateTime } from 'luxon';
import { DividerVerticalIcon } from '@radix-ui/react-icons';
import cx from 'classnames';

function currencyString(value: number) {
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    // above 1000, no decimal places, above 100, 1 decimal place, above 10, 2 decimal places, above 1 3 decimal places, otherwise 4 decimal places
    maximumFractionDigits:
      value > 1000
        ? 0
        : value > 100
          ? 1
          : value > 10
            ? 2
            : value > 1
              ? 3
              : value > 0.1
                ? 4
                : value > 0.01
                  ? 5
                  : value > 0.001
                    ? 6
                    : value > 0.0001
                      ? 7
                      : 8,
    minimumFractionDigits: 0,
  }).format(value);
}

export const StrategiesTab = ({ outcomeEvents }: { outcomeEvents: OutcomeEvent[] }) => {
  const [displayMode, setDisplayMode] = useState({ mode: 'light' });
  const [name, setName] = useState('');
  const [tab, setTab] = useState('indicators');

  let biggestWin = {
    delta: 0,
    deltaPerc: 0,
  };
  let biggestLoss = {
    delta: 0,
    deltaPerc: 0,
  };
  let totalPerc = 0;

  outcomeEvents.forEach(event => {
    if (event.outcome.delta > biggestWin.delta) {
      biggestWin.delta = event.outcome.delta;
      biggestWin.deltaPerc = event.outcome.percDelta;
    }
    if (event.outcome.delta < biggestLoss.delta) {
      biggestLoss.delta = event.outcome.delta;
      biggestLoss.deltaPerc = event.outcome.percDelta;
    }
    totalPerc += event.outcome.delta;
  });

  const averagePerformance = totalPerc / outcomeEvents.length;

  return (
    <div className={'flex flex-row !h-full w-full p-3'}>
      <div className={'flex flex-row w-[300px]'}>
        <div className={'flex flex-col gap-2'}>
          <Heading size={'3'}>Summary</Heading>

          <div className={'flex flex-row items-center gap-1'}>
            <Heading size={'2'}>Trade Count:</Heading>
            <p>{outcomeEvents.length}</p>
          </div>

          <div className={'flex flex-row items-center gap-1'}>
            <Heading size={'2'}>Biggest Win:</Heading>
            <div className={'flex gap-1 items-center text-[var(--jade-11)]'}>
              <p>{currencyString(biggestWin.delta)}</p>
              <p className="text-sm">({biggestWin.deltaPerc.toFixed(2)}%)</p>
            </div>
          </div>

          <div className={'flex flex-row items-center gap-1'}>
            <Heading size={'2'}>Biggest Loss:</Heading>
            <div className={cx('flex gap-1 items-center text-[var(--tomato-11)]')}>
              <p>{currencyString(biggestLoss.delta)}</p>
              <p className="text-sm">({biggestLoss.deltaPerc.toFixed(2)}%)</p>
            </div>
          </div>

          <div className={'flex flex-row items-center gap-1'}>
            <Heading size={'2'}>Average Performance:</Heading>
            <p className={`${averagePerformance > 0 ? 'text-[var(--jade-11)]' : 'text-[var(--tomato-11)]'}`}>
              {averagePerformance.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <div className={'flex flex-row flex-1'}>
        <div className={'flex flex-col flex-1 gap-2'}>
          <Heading size={'3'}>Trade List</Heading>

          <div className={'flex flex-col overflow-auto flex-auto h-0'}>
            {outcomeEvents.map((event, index) => (
              <>
                <div key={index} className={'flex flex-row gap-5 items-center'}>
                  <p>{index}</p>
                  <div className={'flex flex-col'}>
                    <div
                      className={cx(
                        `flex flex-row gap-5 justify-between`,
                        displayMode.mode === 'dark' ? 'text-[#5C7C2F]' : 'text-[#BDE56C]'
                      )}
                    >
                      {/*Unix time to human time with luxon*/}
                      <p className="w-8">Entry</p>
                      <p>{DateTime.fromSeconds(event.trigger.time).toFormat('yyyy-MM-dd HH:mm:ss')}</p>
                      <p className="w-24">{currencyString((event.trigger.data as any).close)}</p>
                    </div>
                    <div className={`flex flex-row gap-5`}>
                      <p className="w-8">Exit</p>
                      <p>{DateTime.fromSeconds(event.outcome.time).toFormat('yyyy-MM-dd HH:mm:ss')}</p>
                      <p className="w-24">{currencyString((event.outcome.data as any).close)}</p>
                    </div>
                  </div>

                  <div
                    className={`flex flex-row gap-2 items-center ${event.outcome.delta > 0 ? 'text-[var(--jade-11)]' : 'text-[var(--tomato-11)]'}`}
                  >
                    <p>{currencyString(event.outcome.delta)}</p>
                    <p className="text-sm">({event.outcome.percDelta.toFixed(2)}%)</p>
                  </div>
                </div>

                {index < outcomeEvents.length - 1 && <hr />}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
