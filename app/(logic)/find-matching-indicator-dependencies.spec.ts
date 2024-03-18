import { findUsedVariablesInCode } from '@/app/(logic)/find-used-variables-in-code';

describe('Variable Usage Detection', () => {
  test.each([
    ['const a = sma_value + 1', ['sma_value']],
    ['const a = sma_value;', ['sma_value']],
    ['const a = sma_value ', ['sma_value']],
    ['sma_value[0]', ['sma_value']],
    ['() => { return { value: sma_value + 1000 } };', ['sma_value']],
    ['const a = sma_value2 + 1', []],
    ['const a = sma_values;', []],
    ['sma_values[0]', []],
    ['// sma_value', []],
  ])('Variable "%s" usage in code should be detected correctly', (code, expectedVariables) => {
    const potentialVariables = ['sma_value']; // List all variables you're interested in
    const usedVariables = findUsedVariablesInCode(code, potentialVariables);
    expect(usedVariables).toEqual(expect.arrayContaining(expectedVariables));
    expect(usedVariables.length).toBe(expectedVariables.length);
  });
});
