FROM node:12-alpine

ENV PORT 8080
EXPOSE 8080

RUN addgroup embetty && adduser embetty -D -G embetty \
    && mkdir /app \
    && chown -R embetty:embetty /app/

WORKDIR /app
USER embetty

ADD package.json yarn.lock /app/
RUN yarn install --frozen-lockfile
ADD . /app

CMD yarn start
