FROM alpine:3.8

ENV PORT 8080
EXPOSE 8080

RUN apk add --update --no-cache nodejs git yarn \
    && addgroup embetty && adduser embetty -D -G embetty \
    && mkdir /app \
    && chown -R embetty:embetty /app/

WORKDIR /app
USER embetty

ADD package.json yarn.lock /app/
RUN yarn install
ADD . /app

CMD yarn start
