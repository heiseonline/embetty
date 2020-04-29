module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['index.ts', 'lib/**/*.ts'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  moduleNameMapper: {
    '([^/]+\\.(scss|svg))$': '<rootDir>/__mocks__/$1.js',
  },
  preset: 'ts-jest',
  testPathIgnorePatterns: ['/dist/'],
  testEnvironment: 'jest-environment-jsdom-sixteen',
  setupFilesAfterEnv: ['./test/setup.js'],
}
