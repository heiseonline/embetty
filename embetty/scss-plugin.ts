import type { BunPlugin } from 'bun'
import { compileAsync } from 'sass'

// Components put their styles into shadow roots, so a stylesheet import
// yields the compiled CSS as a string instead of a bundled .css file.
export const scss: BunPlugin = {
  name: 'scss',
  setup(build) {
    build.onLoad({ filter: /\.scss$/ }, async ({ path }) => ({
      // Without charset: false, sass prefixes non-ASCII output with a BOM,
      // which turns the first selector inside <style> invalid.
      contents: (
        await compileAsync(path, { style: 'compressed', charset: false })
      ).css,
      loader: 'text',
    }))
  },
}
