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
          offsetBetweenTriggerAndOutcome: 0,
        },
        operator: 'crossover',
        fieldB: {
          property: 'sma50_value',
          offsetBetweenTriggerAndOutcome: 0,
        },
      },
      {
        fieldA: {
          property: 'sma20_value',
          offsetBetweenTriggerAndOutcome: 1,
        },
        operator: 'crossover',
        fieldB: {
          property: 'sma50_value',
          offsetBetweenTriggerAndOutcome: 0,
        },
      },
    ],
    failureConditions: [
      {
        fieldA: {
          property: 'sma20_value',
          offsetBetweenTriggerAndOutcome: 0,
        },
        operator: 'crossover',
        fieldB: {
          property: 'sma50_value',
          offsetBetweenTriggerAndOutcome: 0,
        },
      },
    ],
    enabled: true,
  };

  //   test('buildFunctionComponents', () => {
  //     const result = buildFunctionComponents(outcome);
  //     expect(result.inputDeclarations).toEqual([
  //       'const a0 = index => inputData[index + 0].sma20_value;',
  //       'const b0 = index => inputData[index + 0].sma50_value;',
  //       'const a1 = index => inputData[index + 1].sma20_value;',
  //       'const b1 = index => inputData[index + 0].sma50_value;',
  //     ]);
  //     expect(result.funcStrs).toEqual([
  //       `const condition0 = (a0, b0) => {
  //   return a0(0) > b0(0) && ((a0(1) < b0(1)) || (a0(1) === b0(1) && a0(2) < b0(2)));
  // }`,
  //       `const condition1 = (a1, b1) => {
  //   return a1(0) > b1(0) && ((a1(1) < b1(1)) || (a1(1) === b1(1) && a1(2) < b1(2)));
  // }`,
  //     ]);
  //   });

  test('full', () => {
    const fullFunc = buildOutcomeFunc({ outcome });
    expect(fullFunc).toEqual(
      `const outcome = () => {
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

if (condition_success_0(success_a0, success_b0) &&
  condition_success_1(success_a1, success_b1)) {
  return true;
}
if (condition_failure_0(failure_a0, failure_b0)) {
  return false;
}

return null;
}`
    );
  });
});
