ARG NODE_IMAGE=node:24.22.1-alpine

FROM ${NODE_IMAGE} AS builder
WORKDIR /build
COPY . .
RUN corepack enable \
  && pnpm i --frozen-lockfile \
  && pnpm build \
  && pnpm --filter server --prod deploy .target

FROM ${NODE_IMAGE}

ENV TZ=Europe/Berlin
ENV LC_ALL=de_DE.UTF-8
ENV NODE_ENV=production
ENV PORT 8080
ENV NODE_OPTIONS="--max-old-space-size=500 --dns-result-order=ipv4first"

WORKDIR /app
USER nobody

COPY --chown=nobody:nobody --from=builder /build/.target /app

CMD node dist/server.js
