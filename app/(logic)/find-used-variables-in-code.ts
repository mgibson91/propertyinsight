import { NodePath } from '@babel/traverse';

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

export function findUsedVariablesInCode(code: string, variableNames: string[]) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript'],
  });

  let usedVariables: string[] = [];

  traverse(ast, {
    enter(path: NodePath) {
      if (path.isIdentifier() && variableNames.includes(path.node.name) && !usedVariables.includes(path.node.name)) {
        usedVariables.push(path.node.name);
      }
    },
  });

  return usedVariables;
}
