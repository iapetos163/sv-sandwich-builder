/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteNameTemplate: (vars) =>
          vars.filepath.replace(/(\/index)?\.test\.ts$/, ''),
      },
    ],
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
