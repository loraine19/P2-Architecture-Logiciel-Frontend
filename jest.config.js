module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts|js)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  // Force la transformation des modules ECMAScript d'Angular
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  collectCoverage: true,
  coverageDirectory: 'coverage/jest',
  coverageReporters: ['html', 'lcov'],
  testEnvironment: 'jest-environment-jsdom',
};