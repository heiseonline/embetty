---
'@embetty/base': patch
'@embetty/types': major
'@embetty/component': patch
---

- `@embetty/base`: the LRU cache now honors `max` from `EMBETTY_CACHE` (e.g. `lru://max:500`); it was always 100 before. `TwitterErrorType` is a plain object instead of a TypeScript enum.
- `@embetty/types`: Mastodon fields typed as `any` now have their actual types, including `null` where the API returns it.
- `@embetty/component`: errors while loading an embed are logged instead of surfacing as unhandled rejections.
