import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

// jest.integration.config.js

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(int).[jt]s?(x)'], // or '**/__tests__/**/*.integration.ts' depending on your file naming
  // globalSetup: './test-utils/globalSetup.ts', // if you need any global setup
  // globalTeardown: './test-utils/globalTeardown.ts', // if you need any global teardown
  setupFiles: ['./test-setup.ts'], // if you need any setup before tests are run
  // setupFilesAfterEnv: ['./test-utils/setupAfterEnv.ts'], // if you need to setup test framework
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

// module.exports = {
//
//   transform: {
//     '^.+\\.ts$': 'ts-jest',
//   },
// };
