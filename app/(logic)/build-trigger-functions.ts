/**
 * 1. Build initial functions (store generated function names)
 * 2. Build calculation function
 * 3. Iterate through data calculating each function
 *    - For now, expect trigger code to only operate on valid data (if (close[0])
 * 4. Look at dynamically detecting function length
 */
import { Trigger, TriggerCondition } from '@/components/triggers/edit-trigger';
import { buildIndicatorStreamVariables } from '@/app/(logic)/get-consolidated-series-new';

export function buildFullTriggerFunc({
  triggerFuncStr,
  existingIndicatorMetadata,
}: {
  triggerFuncStr: string;
  existingIndicatorMetadata: { streamTag: string; indicatorTag: string }[];
}): string {
  let adjustedFunc = `
const inputData = data.data;
const open = inputData.map(d => d.open);
const high = inputData.map(d => d.high);
const low = inputData.map(d => d.low);
const close = inputData.map(d => d.close);

${buildIndicatorStreamVariables(existingIndicatorMetadata)}

// TODO: Add trigger variable selection
const a =

//--- USER DEFINED - must have trigger() ---
${triggerFuncStr}

// Call the user provided function
return trigger(a, b); 
`;

  return adjustedFunc;
}

// export function buildTriggerFunc(trigger: Trigger): string {
//   const components = buildFunctionComponents(trigger);
//
//   const declarations = components.funcStrs.join('\n  ');
//   const logic = `return(${components.names.map(name => `${name}(a, b)`).join(' &&\n    ')});`;
//
//   const funcStr = `const trigger = (a, b) => {
//   ${declarations}
//   ${logic}
// }`;
//   return funcStr;
// }

export function buildFunctionComponents(trigger: Trigger): { inputDeclarations: string[]; funcStrs: string[] } {
  const result: { inputDeclarations: string[]; funcStrs: string[] } = {
    inputDeclarations: [],
    funcStrs: [],
  };

  for (let i = 0; i < trigger.conditions.length; i++) {
    // `return(${components.names.map(name => `${name}(a, b)`).join(' &&\n    ')});`;
    /**
     * Return condition1(a1,b1) & const a1 = close.slice(0); b1 = close.slice(1);
     *
     *
     */

    const condition = trigger.conditions[i];

    const fieldAName = `a${i}`;
    const fieldBName = `b${i}`;

    // TODO: Support if property === 'value', then fixed
    result.inputDeclarations.push(
      `const ${fieldAName} = index => data[index].${condition.fieldA.property}.slice(${condition.fieldA.offset});`
    );
    result.inputDeclarations.push(
      `const ${fieldBName} = index => data[index].${condition.fieldB.property}.slice(${condition.fieldB.offset});`
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

function buildConditionFuncStr({
  fieldA,
  fieldB,
  funcName,
  condition,
}: {
  fieldA: string;
  fieldB: string;
  funcName: string;
  condition: TriggerCondition;
}): string {
  let funcStr = `const ${funcName} = (${fieldA}, ${fieldB}) => {
`;

  if (condition.operator === 'crossover') {
    funcStr += `  return ${fieldA}[0] > ${fieldB}[0] && ((${fieldA}[1] < ${fieldB}[1]) || (${fieldA}[1] === ${fieldB}[1] && ${fieldA}[2] < ${fieldB}[2]));`;
  }

  funcStr += `
}`;

  // TODO: Add support for user defined functions
  return funcStr;
}
