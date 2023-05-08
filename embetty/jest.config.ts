import { createDefaultJestConfigFromDir } from '@embetty/jest-config'

export default createDefaultJestConfigFromDir(__dirname).then((baseConfig) => ({
  ...baseConfig,
  moduleNameMapper: {
    '([^/]+\\.(scss|svg))$': '<rootDir>/__mocks__/$1.ts',
  },
  setupFilesAfterEnv: ['./src/test/setup.js'],
  testURL: 'http://localhost/',
  testEnvironment: 'jsdom',
}))
