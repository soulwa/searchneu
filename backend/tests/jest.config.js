module.exports = {
  name: 'dbtest',
  displayName: 'Database Tests',
  rootDir: '../../',
  testMatch: ['<rootDir>/backend/'],
  setupFiles: undefined,
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'node',
    'tsx',
    'ts'
  ],
  testMatch: [
    '**/*.{spec,test}\.seq\.[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/backend/tests/jest.config.js',
    '<rootDir>/node_modules',
    '<rootDir>/dist/',
  ],
  setupFiles: [
    '<rootDir>/regtests/jestSetupFile.js',
  ],
  testEnvironment: '<rootDir>/backend/tests/backend_test_env.ts',
};

