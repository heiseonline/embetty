import type { Config } from '@jest/types'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

interface PackageManifest {
  name: string
}

async function readPackageName(dir: string): Promise<string> {
  const manifest = JSON.parse(
    await readFile(path.join(dir, 'package.json'), 'utf8'),
  ) as PackageManifest

  return manifest.name
}

// `preset` is missing from the InitialProjectOptions type.
type ProjectConfig = Config.InitialProjectOptions & { preset: string }

export const createDefaultJestConfigFromDir = async (
  dir: string,
): Promise<ProjectConfig> => ({
  rootDir: dir,
  displayName: { name: await readPackageName(dir), color: 'cyan' },
  testPathIgnorePatterns: ['/dist/'],
  snapshotFormat: { printBasicPrototype: false },
  coverageDirectory: '<rootDir>/artifacts/coverage',
  preset: 'ts-jest',
})
