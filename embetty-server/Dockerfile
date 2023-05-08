FROM node:lts-alpine

ENV TZ=Europe/Berlin
ENV LC_ALL=de_DE.UTF-8
ENV NODE_ENV=production
ENV PORT 8080
ENV NODE_OPTIONS="--max-old-space-size=500 --no-experimental-fetch --dns-result-order=ipv4first"

WORKDIR /app
USER nobody

COPY --chown=nobody:nobody . .

CMD node dist/server.js
