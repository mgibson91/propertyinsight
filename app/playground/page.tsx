'use client';

import IndicatorSearchView from '@/components/indicators/add-indicator';
import { PRESET_INDICATORS } from '@/logic/indicators/preset-indicator';
import DemoComponent from '@/app/playground/DemoComponent';
import SlideToggle from '@/app/playground/SlideToggle';
import React, { useState } from 'react';
import SlideToggle2 from '@/shared/layout/slide-toggle2';
import { EditTrigger } from '@/components/triggers/edit-trigger';

// Mock data array
// const indicators: Indicator[] = [
//   {
//     id: 'sma',
//     type: IndicatorType.SMA,
//     label: 'Simple Moving Average',
//     params: [
//       {
//         name: 'windowSize',
//         widget: IndicatorParamWidget.INPUT,
//         type: IndicatorParamType.NUMBER,
//         label: 'Window Size',
//         defaultValue: 20,
//       },
//       { name: 'field', widget: IndicatorParamWidget.SELECT, type: IndicatorParamType.FIELD, label: 'Field' },
//     ],
//     funcStr: `const windowSize = %windowSize%;  // Setting the period for SMA
//
//   const smaData = data.map((current, index) => {
//     if (index >= windowSize - 1) {
//       // Calculate SMA only when there are enough preceding data points
//       let sum = 0;
//       // Sum the closing prices of the last 'windowSize' days
//       for (let i = index - windowSize + 1; i <= index; i++) {
//         sum += data[i]['%field%'];
//       }
//       let average = sum / windowSize;
//       return { time: current.time, value: average };
//     } else {
//       return null;  // Not enough data to calculate SMA
//     }
//   });`,
//   },
// ];

export default function Page() {
  const [trigger, setTrigger] = useState({
    name: 'Hello',
    conditions: [
      {
        fieldA: {
          property: 'sma20',
          offset: 0,
        },
        operator: '>',
        fieldB: {
          property: 'sma50',
          offset: 0,
        },
      },
      {
        fieldA: {
          property: 'sma20',
          offset: 1,
        },
        operator: '>',
        fieldB: {
          property: 'sma50',
          offset: 1,
        },
      },
    ],
  });

  return (
    <div className={'w-full h-full flex items-center justify-center'}>
      {/*<IndicatorSearchView indicators={PRESET_INDICATORS}></IndicatorSearchView>*/}
      {/*<DemoComponent />*/}
      {/*/!*<SlideToggle*!/*/}
      {/*/!*  trigger={*!/*/}
      {/*/!*    <button className="z-2 px-4 py-2 bg-blue-500 text-white cursor-pointer font-semibold rounded hover:bg-blue-700 transition duration-300">*!/*/}
      {/*/!*      Toggle Content*!/*/}
      {/*/!*    </button>*!/*/}
      {/*/!*  }*!/*/}
      {/*/!*>*!/*/}
      {/*/!*  <div className="p-4 border border-gray-200 shadow rounded bg-white h-[300px]">*!/*/}
      {/*/!*    This is the content that slides into view directly below the button. This is the content that slides into view*!/*/}
      {/*/!*    directly below the button. This is the content that slides into view directly below the button. This is the*!/*/}
      {/*/!*    content that slides into view directly below the button. This is the content that slides into view directly*!/*/}
      {/*/!*    below the button. This is the content that slides into view directly below the button.*!/*/}
      {/*/!*  </div>*!/*/}
      {/*/!*</SlideToggle>*!/*/}

      {/*<SlideToggle2*/}
      {/*  heightClass="h-50px"*/}
      {/*  trigger={*/}
      {/*    <button className="z-2 px-4 py-2 bg-blue-500 text-white cursor-pointer font-semibold rounded hover:bg-blue-700 transition duration-300">*/}
      {/*      Toggle Content*/}
      {/*    </button>*/}
      {/*  }*/}
      {/*>*/}
      {/*  <div className="p-4 border border-gray-200 shadow bg-white rounded h-full">*/}
      {/*    This is the content that slides into view directly below the button. This is the content that slides into view*/}
      {/*    directly below the button. This is the content that slides into view directly below the button. This is the*/}
      {/*    content that slides into view directly below the button. This is the content that slides into view directly*/}
      {/*    below the button. This is the content that slides into view directly below the button.*/}
      {/*  </div>*/}
      {/*</SlideToggle2>*/}

      <div className="!w-1/2 !h-1/2">
        <EditTrigger
          trigger={trigger}
          updateTrigger={newTrigger => {
            setTrigger(newTrigger);
          }}
          properties={{
            default: ['close', 'open', 'high', 'low'],
            indicator: [
              {
                indicatorTag: 'sma20',
                streamTag: ['value'],
              },
              {
                indicatorTag: 'sma50',
                streamTag: ['value'],
              },
            ],
          }}
          operators={[
            {
              label: '=',
              func: '(a,b) => a === b',
            },
            {
              label: '>',
              func: '(a,b) => a > b',
            },
            {
              label: '<',
              func: '(a,b) => a < b',
            },
            {
              label: '>=',
              func: '(a,b) => a >= b',
            },
            {
              label: '<=',
              func: '(a,b) => a <= b',
            },
          ]}
        />
      </div>
    </div>
  );
}
