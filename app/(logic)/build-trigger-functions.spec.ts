/**
 * 1. Build initial functions (store generated function names)
 * 2. Build calculation function
 * 3. Iterate through data calculating each function
 *    - For now, expect trigger code to only operate on valid data (if (close[0])
 * 4. Look at dynamically detecting function length
 */
import { Trigger, TriggerCondition } from '@/components/triggers/edit-trigger';
import { buildFunctionComponents, buildTriggerFunc } from '@/app/(logic)/build-trigger-functions';

describe('buildFunctionComponents', () => {
  const trigger: Trigger = {
    id: '1',
    name: 'Test Trigger',
    conditions: [
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
    enabled: true,
  };

  test('buildFunctionComponents', () => {
    const result = buildFunctionComponents(trigger);
    expect(result.inputDeclarations).toEqual([
      'const a0 = index => data[index].sma20_value.slice(0);',
      'const b0 = index => data[index].sma50_value.slice(0);',
      'const a1 = index => data[index].sma20_value.slice(1);',
      'const b1 = index => data[index].sma50_value.slice(0);',
    ]);
    expect(result.funcStrs).toEqual([
      `const condition0 = (a0, b0) => {
  return a0[0] > b0[0] && ((a0[1] < b0[1]) || (a0[1] === b0[1] && a0[2] < b0[2]));
}`,
      `const condition1 = (a1, b1) => {
  return a1[0] > b1[0] && ((a1[1] < b1[1]) || (a1[1] === b1[1] && a1[2] < b1[2]));
}`,
    ]);
  });

  test('full', () => {
    const fullFunc = buildTriggerFunc(trigger);
    expect(fullFunc).toEqual(
      `const trigger = () => {
const a0 = index => data[index].sma20_value.slice(0);
const b0 = index => data[index].sma50_value.slice(0);
const a1 = index => data[index].sma20_value.slice(1);
const b1 = index => data[index].sma50_value.slice(0);

const condition0 = (a0, b0) => {
  return a0[0] > b0[0] && ((a0[1] < b0[1]) || (a0[1] === b0[1] && a0[2] < b0[2]));
}
const condition1 = (a1, b1) => {
  return a1[0] > b1[0] && ((a1[1] < b1[1]) || (a1[1] === b1[1] && a1[2] < b1[2]));
}

return(condition0(a0, b0) &&
  condition1(a1, b1));
}`
    );
  });
});
