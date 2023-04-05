module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['index.ts', 'lib/**/*.ts'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  moduleNameMapper: {
    '([^/]+\\.(scss|svg))$': '<rootDir>/__mocks__/$1.ts',
  },
  preset: 'ts-jest',
  testPathIgnorePatterns: ['/dist/'],
  setupFilesAfterEnv: ['./test/setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  verbose: true,
  testURL: "http://localhost/",
}
