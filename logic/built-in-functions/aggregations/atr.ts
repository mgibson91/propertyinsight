// https://www.bajajfinserv.in/average-true-range-atr#:~:text=The%20formula%20for%20ATR%20is,%2B%20TR14)%20%2F%2014
export function atr(data: { close: number; low: number; high: number }[], length: number) {
  function calculateTR(index: number) {
    const highLowDiff = data[index].high - data[index].low;
    const highPrevCloseDiff = index === 0 ? 0 : Math.abs(data[index].high - data[index - 1].close);
    const lowPrevCloseDiff = index === 0 ? 0 : Math.abs(data[index].low - data[index - 1].close);
    return Math.max(highLowDiff, highPrevCloseDiff, lowPrevCloseDiff);
  }

  const trueRanges = [];
  for (let i = 0; i < length; i++) {
    trueRanges.push(calculateTR(i));
  }

  const atr = trueRanges.reduce((acc, val) => acc + val, 0) / length;
  return atr;
}

export const ATR_FUNCTION = `function atr(length) {
  if (data.length < length) {
    return null;
  }
  
  function calculateTR(index) {
    const highLowDiff = data[index].high - data[index].low;
    const highPrevCloseDiff = index === 0 ? 0 : Math.abs(data[index].high - data[index - 1].close);
    const lowPrevCloseDiff = index === 0 ? 0 : Math.abs(data[index].low - data[index - 1].close);
    return Math.max(highLowDiff, highPrevCloseDiff, lowPrevCloseDiff);
  }

  const trueRanges = [];
  for (let i = 0; i < length; i++) {
    trueRanges.push(calculateTR(i));
  }

  const atr = trueRanges.reduce((acc, val) => acc + val, 0) / length;
  return atr;
}`;
