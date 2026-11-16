---
'@embetty/base': major
'@embetty/types': major
'@embetty/server': major
'@embetty/component': major
---

Packages are built with Bun instead of tsc and webpack.

- `@embetty/base` and `@embetty/types` ship one bundled CommonJS file plus declarations and declare `exports`; deep imports such as `@embetty/base/src/...` no longer work.
- `@embetty/component` ships a minified IIFE bundle (`dist/embetty.js`) that targets current browsers; it no longer declares `engines`.
- `@embetty/server`: `npm start` runs `dist/server.js` (the referenced `bin/www` did not exist), and `dotenv` is no longer a dependency; set environment variables directly.
