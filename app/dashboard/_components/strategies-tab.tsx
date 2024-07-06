import { Indicator } from '@/logic/indicators/types';
import { UserOutcome, UserTrigger } from '@/app/(logic)/types';
import React, { useEffect, useState } from 'react';
import { Button, TextFieldInput } from '@radix-ui/themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Strategy } from '@/app/dashboard/types';

export const StrategiesTab = ({ currentStrategy }: { currentStrategy?: Strategy }) => {
  const [name, setName] = useState('');
  const [tab, setTab] = useState('indicators');

  useEffect(() => {
    if (currentStrategy) {
      setName(currentStrategy.name);
    }
  }, [currentStrategy]);

  return (
    <div className={'flex flex-col w-full'}>
      <div className={'flex flex-row flex-1 justify-between items-center bg-accent-bg h-[36px] px-2'}>
        <div className={'flex flex-col'}>
          <div className={'flex flex-row justify-between items-center gap-2'}>
            <Tabs
              orientation={'horizontal'}
              className={'flex-auto flex bg-accent-bg'}
              onValueChange={value => setTab(value)}
            >
              <TabsList className={'bg-accent-bg'}>
                <TabsTrigger
                  className={'ring-offset-bg-accent-bg bg-accent-bg data-[state=active]:bg-accent-base'}
                  value="indicators"
                >
                  Indicators
                </TabsTrigger>
                <TabsTrigger
                  className={'ring-offset-bg-accent-bg bg-accent-bg data-[state=active]:bg-accent-base'}
                  value="triggers"
                >
                  Triggers
                </TabsTrigger>
                <TabsTrigger
                  className={'ring-offset-bg-accent-bg bg-accent-bg data-[state=active]:bg-accent-base'}
                  value="outcome"
                >
                  Outcome
                </TabsTrigger>
              </TabsList>

              {/*<TabsContent value="indicators">Indicators</TabsContent>*/}

              {/*<TabsContent value="triggers">Triggers</TabsContent>*/}

              {/*<TabsContent value="outcome">Outcome</TabsContent>*/}
            </Tabs>

            <TextFieldInput
              size={'1'}
              placeholder={'Strategy name'}
              className={'min-w-[150px]'}
              value={name}
              onChange={e => {
                console.log(e);
                setName(e.target.value);
              }}
            />
          </div>
        </div>

        <div className={'flex flex-col'}>
          <div className={'flex flex-row gap-2 items-center'}>
            <Button
              size={'1'}
              className={'w-32'}
              // onClick={() =>
              //   onSaveToChartClicked({
              //     funcStr,
              //     name,
              //     inputs,
              //   })
              // }
              variant={'outline'}
            >
              Save to library
            </Button>

            <Button
              className={'w-32'}
              size={'1'}
              // onClick={() =>
              //   // onSaveToChartClicked({
              //   //   funcStr,
              //   //   name,
              //   //   inputs,
              //   // })
              // }
            >
              Save to chart
            </Button>
          </div>
        </div>
      </div>
      <div className={'flex flex-col'}>
        {tab === 'indicators' && <div className={'flex flex-col gap-2 p-3'}>Indicators</div>}

        {tab === 'triggers' && <div className={'flex flex-col gap-2 p-3'}>Triggers</div>}

        {tab === 'outcomes' && <div className={'flex flex-col gap-2 p-3'}>Outcomes</div>}
      </div>
    </div>
  );
};
