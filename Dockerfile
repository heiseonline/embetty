ARG NODE_IMAGE=node:26-trixie-slim

FROM --platform=$BUILDPLATFORM oven/bun:canary AS bun

# The build output and server dependencies are plain JS, so the builder
# runs natively instead of under QEMU for every target platform.
FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} AS builder
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /build
COPY . .
# --ignore-scripts: the only install script is the git hook setup.
# Reinstalling with --production leaves only the server's runtime
# dependencies (incl. its workspace packages) in node_modules.
RUN bun install --frozen-lockfile --ignore-scripts \
  && bun run build \
  && rm -rf node_modules */node_modules libs/*/node_modules tools/*/node_modules \
  && bun install --ignore-scripts --production --filter @embetty/server
# The runtime needs the built packages and their dependencies, no sources.
# A package without runtime dependencies has no node_modules; everything else
# must exist.
RUN mkdir /app \
  && for path in package.json node_modules \
    embetty-server/package.json embetty-server/dist embetty-server/node_modules \
    libs/base/package.json libs/base/dist libs/base/node_modules \
    libs/types/package.json libs/types/dist libs/types/node_modules \
    embetty/package.json embetty/dist embetty/node_modules; do \
    case "$path" in */node_modules) [ -e "$path" ] || continue ;; esac; \
    cp -a --parents "$path" /app; \
  done

FROM ${NODE_IMAGE}

ENV TZ=Europe/Berlin
ENV LC_ALL=C.UTF-8
ENV NODE_ENV=production
ENV PORT=8080
ENV NODE_OPTIONS="--max-old-space-size=500 --dns-result-order=ipv4first"

USER node
COPY --chown=node:node --from=builder /app /app
WORKDIR /app/embetty-server

CMD ["node", "dist/server.js"]
