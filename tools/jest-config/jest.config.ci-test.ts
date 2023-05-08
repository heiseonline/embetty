/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Config } from '@jest/types'
import findPackages, { Project } from '@pnpm/find-workspace-packages'
import { defaults } from 'jest-config'
import path from 'path'

const workspaceRoot = path.join(__dirname, '../..')

export const createDefaultJestConfig = (
  pkg: Project,
): Config.InitialProjectOptions => ({
  rootDir: pkg.dir,
  // roots: ['<rootDir>/src'],
  displayName: {
    name: pkg.manifest.name!,
    color: pkg.dir.includes('service') ? 'cyanBright' : 'cyan',
  },
  testPathIgnorePatterns: ['/dist/'],
  snapshotFormat: {
    printBasicPrototype: false,
  },

  coveragePathIgnorePatterns: [
    '/node_modules/',
    'index.ts',
    '.module.ts',
    '.dto.ts',
    '.config.ts',
    'main.ts',
    '.stories.tsx',
    '.interfaces.ts',
  ],

  // `preset` fehlt in den Types von `InitialProjectOptions`

  // @ts-ignore
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
})

const config: () => Promise<Config.InitialOptions> = async () => {
  const packages = await findPackages(workspaceRoot)

  const projects: Config.InitialProjectOptions[] = packages
    .filter((pkg) => pkg.manifest.name !== '@embetty/monorepo')
    .map((pkg) => createDefaultJestConfig(pkg))

  const config: Config.InitialOptions = {
    coveragePathIgnorePatterns: [
      ...defaults.coveragePathIgnorePatterns,
      'libs/testing',
      '.dto.ts$',
      '.config.ts',
    ],

    globals: {
      'ts-jest': {
        isolatedModules: true,
      },
    },

    // https://kulshekhar.github.io/ts-jest/docs/26.5/guides/using-with-monorepo/
    projects,

    // TODO: unit-test-config
    reporters: [
      'default',
      [
        'jest-junit',
        {
          outputDirectory: '<rootDir>/artifacts',
          outputName: 'junit.test.xml',
          uniqueOutputName: 'false',
          suiteNameTemplate: '{filename}',
          classNameTemplate: '{classname}',
          titleTemplate: '{title}',
          ancestorSeparator: ' › ',
        },
      ],
    ],
    collectCoverageFrom: ['<rootDir>/**/src/**/*.{ts,tsx}', '!**/*.d.ts'],
    coverageReporters: ['lcov', 'cobertura', 'text'],
    coverageDirectory: '<rootDir>/artifacts/coverage',
  }

  // console.log(config)

  return config
}

export default config
