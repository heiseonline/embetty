FROM node:lts-alpine as builder
WORKDIR /build
COPY . .
RUN corepack enable \
  && pnpm i --frozen-lockfile \
  && pnpm build \
  && pnpm --filter server --prod deploy .target

FROM node:lts-alpine

ENV TZ=Europe/Berlin
ENV LC_ALL=de_DE.UTF-8
ENV NODE_ENV=production
ENV PORT 8080
ENV NODE_OPTIONS="--max-old-space-size=500 --no-experimental-fetch --dns-result-order=ipv4first"

WORKDIR /app
USER nobody

COPY --chown=nobody:nobody --from=builder /build/.target /app

CMD node dist/server.js
