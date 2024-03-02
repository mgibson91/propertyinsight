import { Indicator, IndicatorParamType, IndicatorParamWidget, IndicatorType } from '@/common/indicator/types';
import AddIndicatorView from '@/components/indicators/add-indicator';

// Mock data array
const indicators: Indicator[] = [
  {
    id: 'sma',
    type: IndicatorType.SMA,
    label: 'Simple Moving Average',
    params: [
      {
        name: 'windowSize',
        widget: IndicatorParamWidget.INPUT,
        type: IndicatorParamType.NUMBER,
        label: 'Window Size',
        defaultValue: 20,
      },
      { name: 'field', widget: IndicatorParamWidget.SELECT, type: IndicatorParamType.FIELD, label: 'Field' },
    ],
    funcStr: `const windowSize = %windowSize%;  // Setting the period for SMA
  
  const smaData = data.map((current, index) => {
    if (index >= windowSize - 1) {
      // Calculate SMA only when there are enough preceding data points
      let sum = 0;
      // Sum the closing prices of the last 'windowSize' days
      for (let i = index - windowSize + 1; i <= index; i++) {
        sum += data[i]['%field%'];
      }
      let average = sum / windowSize;
      return { time: current.time, value: average };
    } else {
      return null;  // Not enough data to calculate SMA
    }
  });`,
  },
];

export default function Page() {
  return (
    <div className={'w-full h-full'}>
      <AddIndicatorView indicators={indicators}></AddIndicatorView>
    </div>
  );
}
