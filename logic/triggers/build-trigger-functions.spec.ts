/**
 * 1. Build initial functions (store generated function names)
 * 2. Build calculation function
 * 3. Iterate through data calculating each function
 *    - For now, expect trigger code to only operate on valid data (if (close[0])
 * 4. Look at dynamically detecting function length
 */
import { Trigger, TriggerCondition, TriggerId } from '@/components/triggers/edit-trigger';
import { buildFunctionComponents, buildTriggerFunc } from '@/logic/triggers/build-trigger-functions';

describe('buildFunctionComponents', () => {
  describe('two stream trigger', () => {
    const BASIC_TRIGGER: Trigger = {
      id: '1' as TriggerId,
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

    test('components', () => {
      const result = buildFunctionComponents(BASIC_TRIGGER);
      expect(result.inputDeclarations).toEqual([
        'const a0 = index => data[index + 0].sma20_value;',
        'const b0 = index => data[index + 0].sma50_value;',
        'const a1 = index => data[index + 1].sma20_value;',
        'const b1 = index => data[index + 0].sma50_value;',
      ]);
      expect(result.funcStrs).toEqual([
        `const condition0 = (a0, b0) => {
  return a0(0) > b0(0) && ((a0(1) < b0(1)) || (a0(1) === b0(1) && a0(2) < b0(2)));
}`,
        `const condition1 = (a1, b1) => {
  return a1(0) > b1(0) && ((a1(1) < b1(1)) || (a1(1) === b1(1) && a1(2) < b1(2)));
}`,
      ]);
    });

    test('full', () => {
      const fullFunc = buildTriggerFunc({ trigger: BASIC_TRIGGER });
      expect(fullFunc).toEqual(
        `const trigger = () => {
const a0 = index => data[index + 0].sma20_value;
const b0 = index => data[index + 0].sma50_value;
const a1 = index => data[index + 1].sma20_value;
const b1 = index => data[index + 0].sma50_value;

const condition0 = (a0, b0) => {
  return a0(0) > b0(0) && ((a0(1) < b0(1)) || (a0(1) === b0(1) && a0(2) < b0(2)));
}
const condition1 = (a1, b1) => {
  return a1(0) > b1(0) && ((a1(1) < b1(1)) || (a1(1) === b1(1) && a1(2) < b1(2)));
}

return(condition0(a0, b0) &&
  condition1(a1, b1));
}`
      );
    });
  });

  describe('same stream with transform', () => {
    const TRIGGER_WITH_TRANSFORM: Trigger = {
      id: '1' as TriggerId,
      name: 'Test Trigger',
      conditions: [
        {
          fieldA: {
            property: 'close',
            offset: 0,
          },
          operator: 'crossover',
          fieldB: {
            property: 'close',
            offset: 1,
          },
          fieldBTransform: {
            operator: '+',
            value: 1,
            type: 'percent',
          },
        },
      ],
      enabled: true,
    };

    test('components', () => {
      const result = buildFunctionComponents(TRIGGER_WITH_TRANSFORM);
      expect(result.inputDeclarations).toEqual([
        'const a0 = index => data[index + 0].close;',
        'const b0 = index => data[index + 1].close * 1.01;',
      ]);
      expect(result.funcStrs).toEqual([
        `const condition0 = (a0, b0) => {
  return a0(0) > b0(0) && ((a0(1) < b0(1)) || (a0(1) === b0(1) && a0(2) < b0(2)));
}`,
      ]);
    });
  });
});
