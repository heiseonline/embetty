---
'@embetty/base': patch
'@embetty/server': patch
---

Deleted or unknown tweets are recognized again since the Twitter API reports them under `api.x.com`; the server answers 404 instead of 500. `TwitterErrorType` is no longer exported.
