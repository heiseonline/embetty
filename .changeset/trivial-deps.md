---
'@embetty/base': patch
'@embetty/server': patch
---

- `commander`, `cors`, `http-status` and `content-type` are no longer dependencies.
- The `embetty` and `embetty start` CLI options work again: with commander 10 they were silently ignored. The documented cache default is now the actual one (`lru://`).
- CORS preflights answer `GET, HEAD` as allowed methods, the only ones the server serves.
