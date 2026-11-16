// A fresh Response per call: a body can only be read once.
export const respondWith = (data: unknown): typeof fetch =>
  Object.assign(() => Promise.resolve(Response.json(data)), {
    preconnect: fetch.preconnect,
  })
