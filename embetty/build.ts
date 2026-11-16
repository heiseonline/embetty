import { watch } from 'node:fs'
import pkg from './package.json'
import { inlineCss } from './css-plugin'

const { name, version, homepage, license, author, contributors } = pkg
const banner = `/*! ${name} - v${version}
 * ${homepage}
 * Copyright (c) ${new Date().getFullYear()} Heise Medien GmbH & Co. KG
 * Contributors: ${[author, ...contributors].map((c) => c.name).join(', ')}
 * Licensed under the ${license} license */`

async function build(): Promise<boolean> {
  const result = await Bun.build({
    entrypoints: ['src/index.ts'],
    outdir: 'dist',
    naming: 'embetty.js',
    // Loaded via a classic <script> tag.
    format: 'iife',
    target: 'browser',
    minify: true,
    sourcemap: 'linked',
    banner,
    plugins: [inlineCss],
  })

  for (const log of result.logs) {
    console.error(log)
  }
  return result.success
}

if (process.argv.includes('--watch')) {
  await build()
  watch('src', { recursive: true }, () => void build())
} else if (!(await build())) {
  process.exit(1)
}
