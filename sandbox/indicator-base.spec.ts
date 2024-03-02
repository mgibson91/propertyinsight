// @ts-nocheck

const INITIAL_SERIES = [
  { time: 1, close: 1 },
  { time: 2, close: 2 },
  { time: 3, close: 3 },
  { time: 4, close: 4 },
  { time: 5, close: 5 },
];

describe('indicator base arg', () => {
  test('all', () => {
    const stringFunc = `const windowSize = 2;  // Setting the period for SMA
  
const smaData = data.map((current, index) => {
  if (index >= windowSize - 1) {
    // Calculate SMA only when there are enough preceding data points
    let sum = 0;
    // Sum the closing prices of the last 'windowSize' days
    for (let i = index - windowSize + 1; i <= index; i++) {
      sum += data[i].close;
    }
    let average = sum / windowSize;
    return { time: current.time, value: average };
  } else {
    return null;  // Not enough data to calculate SMA
  }
});

return smaData;`;
    const func = new Function('data', 'period', stringFunc);

    const seriesData = func(INITIAL_SERIES);

    console.log(seriesData);
  });
});

function prependAccessorFunctions(funcString: string): string {
  const adjustedFunc = `
const _open = index => data[index].open;
const _high = index => data[index].high;
const _low = index => data[index].low;
const _close = index => data[index].close;

//--- USER DEFINED ---
${funcString}`;

  return adjustedFunc;
}

describe.only('spread arg', () => {
  test('all', () => {
    const stringFunc = `const open = index => data[index].open;
const high = index => data[index].high;
const low = index => data[index].low;
const close = index => data[index].close;

//--- USER DEFINED ---
const windowSize = 2;  // Setting the period for SMA
  
const smaData = data.map((current, index) => {
  if (index >= windowSize - 1) {
    // Calculate SMA only when there are enough preceding data points
    let sum = 0;
    // Sum the closing prices of the last 'windowSize' days
    for (let i = index - windowSize + 1; i <= index; i++) {
      sum += close(i);
    }
    let average = sum / windowSize;
    return { time: current.time, value: average };
  } else {
    return null;  // Not enough data to calculate SMA
  }
});

return smaData;`;
    const func = new Function('data', 'period', stringFunc);

    const seriesData = func(INITIAL_SERIES);

    console.log(seriesData);
  });
});

function calculate(data: any[]) {
  const close = index => data[index].close;

  //--- USER DEFINED ---
  const windowSize = 2; // Setting the period for SMA

  const smaData = data.map((current, index) => {
    if (index >= windowSize - 1) {
      // Calculate SMA only when there are enough preceding data points
      let sum = 0;
      // Sum the closing prices of the last 'windowSize' days
      for (let i = index - windowSize + 1; i <= index; i++) {
        sum += close(i);
      }
      let average = sum / windowSize;
      return { time: current.time, value: average };
    } else {
      return null; // Not enough data to calculate SMA
    }
  });

  return smaData;
}

describe.only('calc', () => {
  test('all', () => {
    const seriesData = calculate(INITIAL_SERIES);

    console.log(seriesData);
  });
});
