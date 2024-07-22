/**
 * 1. Build initial functions (store generated function names)
 * 2. Build calculation function
 * 3. Iterate through data calculating each function
 *    - For now, expect trigger code to only operate on valid data (if (close[0])
 * 4. Look at dynamically detecting function length
 */
import { FieldTransform, Trigger } from '@/components/triggers/edit-trigger';
import { buildConditionFuncStr } from '@/logic/conditions/build-condition-func-str';
import { buildFieldTransformPostfix } from '@/logic/conditions/build-field-transform-postfix';

export function buildTriggerFunc({ trigger }: { trigger: Trigger }): string {
  const components = buildFunctionComponents(trigger);

  const declarations = components.inputDeclarations.join('\n');

  const logic = `return(${components.funcStrs.map((_, i) => `condition${i}(a${i}, b${i})`).join(' &&\n  ')});`;

  const funcStr = `const trigger = () => {
${declarations}

${components.funcStrs.join('\n')}

${logic}
}`;
  return funcStr;
}

export function buildFunctionComponents(trigger: Trigger): { inputDeclarations: string[]; funcStrs: string[] } {
  const result: { inputDeclarations: string[]; funcStrs: string[] } = {
    inputDeclarations: [],
    funcStrs: [],
  };

  for (let i = 0; i < trigger.conditions.length; i++) {
    const condition = trigger.conditions[i];

    const fieldAName = `a${i}`;
    const fieldBName = `b${i}`;

    // TODO: Support if property === 'value', then fixed
    result.inputDeclarations.push(
      `const ${fieldAName} = index => data[index + ${condition.fieldA.offset}].${condition.fieldA.property};`
    );

    const fieldBTransformString = condition.fieldBTransform
      ? buildFieldTransformPostfix(condition.fieldBTransform)
      : '';
    result.inputDeclarations.push(
      `const ${fieldBName} = index => data[index + ${condition.fieldB.offset}].${condition.fieldB.property}${fieldBTransformString};`
    );

    // TODO: Factor in index here and also return unique condition variable accessor functions
    const funcStr = buildConditionFuncStr({
      fieldA: fieldAName,
      fieldB: fieldBName,
      funcName: `condition${i}`,
      condition,
    });

    result.funcStrs.push(funcStr);
  }

  return result;
}
