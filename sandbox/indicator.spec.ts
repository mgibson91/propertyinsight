enum IndicatorType {
  SMA = 'sma,',
}
enum IndicatorParamType {
  NUMBER = 'number',
  FIELD = 'field',
}

enum IndicatorParamWidget {
  INPUT = 'input',
  SELECT = 'select',
}

interface IndicatorParam {
  name: string;
  type: IndicatorParamType;
  label: string;
  defaultValue?: unknown;
  widget: IndicatorParamWidget;
}

interface Indicator {
  type: IndicatorType; // For type safety of metadata down the line
  label: string;
  funcStr: string;
  params: IndicatorParam[];
}

interface IndicatorParamValue {
  key: string;
  value: unknown;
}

function buildIndicator(indicator: Indicator, params: IndicatorParamValue[]): string {
  let funcStr: string = indicator.funcStr;

  for (const param of indicator.params) {
    const value = params.find(p => p.key === param.name)?.value ?? param.defaultValue;
    const placeholder = `%${param.name}%`;

    funcStr = funcStr.replace(new RegExp(placeholder, 'g'), String(value));
  }

  return funcStr;
}

describe('indicator', () => {
  test('all', () => {
    const indicator: Indicator = {
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
    };

    const params = {
      windowSize: 20,
      field: 'close',
    };

    const output = buildIndicator(indicator, [
      {
        key: 'windowSize',
        value: 20,
      },
      {
        key: 'field',
        value: 'close',
      },
    ]);

    console.log(output);
  });
});
