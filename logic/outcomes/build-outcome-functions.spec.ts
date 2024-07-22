/**
 * 1. Build initial functions (store generated function names)
 * 2. Build calculation function
 * 3. Iterate through data calculating each function
 *    - For now, expect outcome code to only operate on valid data (if (close[0])
 * 4. Look at dynamically detecting function length
 */
import { buildFunctionComponents, buildOutcomeFunc } from '@/logic/outcomes/build-outcome-functions';
import { OutcomeConfig, OutcomeId } from '@/logic/outcomes/types';

describe('buildFunctionComponents', () => {
  const outcome: OutcomeConfig = {
    id: '1' as OutcomeId,
    name: 'Test Outcome',
    successConditions: [
      {
        fieldA: {
          property: 'sma20_value',
          offset: 0,
        },
        operator: 'crossover',
        fieldB: {
          property: 'sma50_value',
          offset: 0,
        },
      },
      {
        fieldA: {
          property: 'sma20_value',
          offset: 1,
        },
        operator: 'crossover',
        fieldB: {
          property: 'sma50_value',
          offset: 0,
        },
      },
    ],
    failureConditions: [
      {
        fieldA: {
          property: 'sma20_value',
          offset: 0,
        },
        operator: 'crossover',
        fieldB: {
          property: 'sma50_value',
          offset: 0,
        },
      },
    ],
    enabled: true,
  };

  test('full', () => {
    const expected = `const outcome = () => {
const success_a0 = index => inputData[index + 0].sma20_value;
const success_b0 = index => inputData[index + 0].sma50_value;
const success_a1 = index => inputData[index + 1].sma20_value;
const success_b1 = index => inputData[index + 0].sma50_value;
const failure_a0 = index => inputData[index + 0].sma20_value;
const failure_b0 = index => inputData[index + 0].sma50_value;

const condition_success_0 = (success_a0, success_b0) => {
  return success_a0(0) > success_b0(0) && ((success_a0(1) < success_b0(1)) || (success_a0(1) === success_b0(1) && success_a0(2) < success_b0(2)));
}
const condition_success_1 = (success_a1, success_b1) => {
  return success_a1(0) > success_b1(0) && ((success_a1(1) < success_b1(1)) || (success_a1(1) === success_b1(1) && success_a1(2) < success_b1(2)));
}
const condition_failure_0 = (failure_a0, failure_b0) => {
  return failure_a0(0) > failure_b0(0) && ((failure_a0(1) < failure_b0(1)) || (failure_a0(1) === failure_b0(1) && failure_a0(2) < failure_b0(2)));
}

if (condition_success_0(success_a0, success_b0) &&
  condition_success_1(success_a1, success_b1)) {
  return true;
}
if (condition_failure_0(failure_a0, failure_b0)) {
  return false;
}

return null;
}`;
    const fullFunc = buildOutcomeFunc({ outcome });
    expect(fullFunc).toEqual(expected);
  });
});

describe('referencing trigger', () => {
  const outcome: OutcomeConfig = {
    id: '1' as OutcomeId,
    name: 'Test Outcome',
    successConditions: [
      {
        fieldA: {
          property: 'close',
          offset: 0,
        },
        operator: 'crossover',
        fieldB: {
          property: 'trigger.close',
          offset: 0,
        },
        fieldBTransform: {
          operator: '+',
          value: 1,
          type: 'percent',
        },
      },
    ],

    failureConditions: [],
    enabled: true,
  };

  test('trigger with transform', () => {
    const expected = `const outcome = () => {
const success_a0 = index => inputData[index + 0].close;
const success_b0 = index => trigger.close * 1.01;


const condition_success_0 = (success_a0, success_b0) => {
  return success_a0(0) > success_b0(0) && ((success_a0(1) < success_b0(1)) || (success_a0(1) === success_b0(1) && success_a0(2) < success_b0(2)));
}


if (condition_success_0(success_a0, success_b0)) {
  return true;
}

return null;
}`;
    const fullFunc = buildOutcomeFunc({ outcome });
    expect(fullFunc).toEqual(expected);
  });
});
