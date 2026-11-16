import { $, type BunPlugin } from 'bun'

// Components put their styles into shadow roots, so a stylesheet import
// yields CSS text: bundled by Bun (@import inlined, nesting lowered for the
// browser targets, minified) instead of emitted as a .css file. A nested
// Bun.build() from inside a plugin never settles, hence the subprocess.
export const inlineCss: BunPlugin = {
  name: 'inline-css',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async ({ path }) => ({
      contents:
        await $`${process.execPath} build ${path} --target=browser --minify`.text(),
      loader: 'text',
    }))
  },
}
