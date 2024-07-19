/**
 * 1. Build initial functions (store generated function names)
 * 2. Build calculation function
 * 3. Iterate through data calculating each function
 *    - For now, expect outcome code to only operate on valid data (if (close[0])
 * 4. Look at dynamically detecting function length
 */
import { buildConditionFuncStr } from '@/logic/conditions/build-condition-func-str';
import { OutcomeConfig, OutcomeCondition } from '@/logic/outcomes/types';

export function buildOutcomeFunc({ outcome }: { outcome: OutcomeConfig }): string {
  const successComponents = buildFunctionComponents(outcome.successConditions, { prefix: 'success_' });
  const failureComponents = buildFunctionComponents(outcome.failureConditions, { prefix: 'failure_' });

  const successDeclarations = successComponents.inputDeclarations.join('\n');
  const failureDeclarations = failureComponents.inputDeclarations.join('\n');

  let logic = '';

  if (successComponents.functions.length) {
    logic += `if (${successComponents.functions
      .map(({ name, fieldNames: { a, b } }) => `${name}(${a}, ${b})`)
      .join(' &&\n  ')}) {
      return true;
  }`;
  }

  if (failureComponents.functions.length) {
    logic += `if (${failureComponents.functions
      .map(({ name, fieldNames: { a, b } }) => `${name}(${a}, ${b})`)
      .join(' &&\n  ')}) {
      return false;
  }`;
  }

  logic += `\n\nreturn null;`;

  const funcStr = `const outcome = () => {
${successDeclarations}
${failureDeclarations}

${successComponents.functions.map(f => f.code).join('\n')}
${failureComponents.functions.map(f => f.code).join('\n')}

${logic}
}`;
  return funcStr;
}

export function buildFunctionComponents(
  conditions: OutcomeCondition[],
  { prefix }: { prefix: string }
): { inputDeclarations: string[]; functions: { code: string; name: string; fieldNames: { a: string; b: string } }[] } {
  const result: {
    inputDeclarations: string[];
    functions: { code: string; name: string; fieldNames: { a: string; b: string } }[];
  } = {
    inputDeclarations: [],
    functions: [],
  };

  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];

    const fieldAName = `${prefix || ''}a${i}`;
    const fieldBName = `${prefix || ''}b${i}`;

    // TODO: Support if property === 'value', then fixed
    result.inputDeclarations.push(
      `const ${fieldAName} = index => inputData[index + ${condition.fieldA.offset}].${condition.fieldA.property};`
    );
    result.inputDeclarations.push(
      `const ${fieldBName} = index => inputData[index + ${condition.fieldB.offset}].${condition.fieldB.property};`
    );

    const name = `condition_${prefix || ''}${i}`;

    // TODO: Factor in index here and also return unique condition variable accessor functions
    const code = buildConditionFuncStr({
      fieldA: fieldAName,
      fieldB: fieldBName,
      funcName: name,
      condition,
    });

    result.functions.push({
      code,
      name,
      fieldNames: { a: fieldAName, b: fieldBName },
    });
  }

  return result;
}
