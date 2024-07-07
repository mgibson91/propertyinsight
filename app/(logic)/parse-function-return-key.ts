export function parseFunctionReturnKeys(functionString: string) {
  const functionBodyMatch = functionString.match(/return\s*{([\s\S]*?)}/);
  if (!functionBodyMatch) {
    throw new Error('Invalid function string format');
  }

  const returnObjectString = functionBodyMatch[1].trim();
  const keys = returnObjectString
    .split(',')
    .map(pair => pair.split(':')[0].trim())
    .filter(key => key !== '');

  return keys;
}
