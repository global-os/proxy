FROM golang:latest AS go_builder

WORKDIR /app

COPY ./drizzle /app
COPY ./package.json /app
COPY ./tsconfig.json /app
COPY ./Dockerfile /app
COPY ./drizzle.config.ts /app
COPY ./src /app
COPY ./yarn.lock /app

RUN go build -o server

FROM amd64/alpine:latest

ENV PORT="3031"
ENV ENV="production"

WORKDIR /app

COPY --from=go_builder /app/proxy_app /app/proxy_app

COPY ./scripts/entrypoint.sh /app/

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
