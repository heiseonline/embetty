ARG NODE_IMAGE=node:26-alpine

FROM ${NODE_IMAGE} AS builder
WORKDIR /build
COPY . .
# Node.js 25+ no longer ships corepack.
RUN npm install --global corepack@0.36.0 \
  && corepack enable \
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
