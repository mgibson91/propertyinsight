import { TriggerCondition } from '@/components/triggers/edit-trigger';

export function buildConditionFuncStr({
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

  switch (condition.operator) {
    case 'crossunder':
      funcStr += `  return ${fieldA}(0) < ${fieldB}(0) && ((${fieldA}(1) > ${fieldB}(1)) || (${fieldA}(1) === ${fieldB}(1) && ${fieldA}(2) > ${fieldB}(2)));`;
      break;
    case 'crossover':
      funcStr += `  return ${fieldA}(0) > ${fieldB}(0) && ((${fieldA}(1) < ${fieldB}(1)) || (${fieldA}(1) === ${fieldB}(1) && ${fieldA}(2) < ${fieldB}(2)));`;
      break;

    case '>':
      funcStr += `  return ${fieldA}(0) > ${fieldB}(0);`;
      break;
    case '<':
      funcStr += `  return ${fieldA}(0) < ${fieldB}(0);`;
      break;
    case '>=':
      funcStr += `  return ${fieldA}(0) >= ${fieldB}(0);`;
      break;
    case '<=':
      funcStr += `  return ${fieldA}(0) <= ${fieldB}(0);`;
      break;
    case '==':
      funcStr += `  return ${fieldA}(0) === ${fieldB}(0);`;
      break;
  }

  funcStr += `
}`;

  // TODO: Add support for user defined functions
  return funcStr;
}
