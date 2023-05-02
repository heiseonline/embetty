import type { Config } from '@jest/types'
import { createDefaultJestConfigFromDir as origFromDir } from './jest.config'

export const createDefaultJestConfigFromDir = async (
  dir: string,
): Promise<Config.InitialProjectOptions> => {
  const config = await origFromDir(dir)

  return {
    ...config,
    roots: ['<rootDir>/test'],
    testRegex: '.e2e-spec.ts$',
  }
}
