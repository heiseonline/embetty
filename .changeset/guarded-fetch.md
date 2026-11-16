---
'@embetty/base': major
---

axios is no longer a dependency. `Embetty` takes a `GuardedFetch` (from `createGuardedFetch()`) instead of an axios instance, request options are `{ url, params, headers, timeout, responseType }`, and cached response headers are a plain object with lower-cased names. `Embetty` and `EmbedOptions` lost their unused type parameter. Unsuccessful responses reject with `HttpStatusError`.
