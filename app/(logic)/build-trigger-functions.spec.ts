/**
 * 1. Build initial functions (store generated function names)
 * 2. Build calculation function
 * 3. Iterate through data calculating each function
 *    - For now, expect trigger code to only operate on valid data (if (close[0])
 * 4. Look at dynamically detecting function length
 */
import { Trigger, TriggerCondition } from '@/components/triggers/edit-trigger';
import { buildFunctionComponents } from '@/app/(logic)/build-trigger-functions';

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

  //     const fullFunc = buildTriggerFunc(trigger);
  //     expect(fullFunc).toEqual(
  //       `const trigger = (a, b) => {
  //   const condition0 = (a, b) => {
  //   return a[0] > b[0] && ((a[1] < b[1]) || (a[1] === b[1] && a[2] < b[2]));
  // }
  //   const condition1 = (a, b) => {
  //   return a[0] > b[0] && ((a[1] < b[1]) || (a[1] === b[1] && a[2] < b[2]));
  // }
  //   return(condition0(a, b) &&
  //     condition1(a, b));
  // }`
  //     );
  //   });
  //
  test('do it', () => {
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
});

function buildFieldDeclarations(trigger: TriggerCondition): string {
  const result = `
  const ${trigger.fieldA.property} = a.map(d => d.${trigger.fieldA.property});
  const ${trigger.fieldB.property} = b.map(d => d.${trigger.fieldB.property});
  `;

  return result;
}
