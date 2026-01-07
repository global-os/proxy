FROM debian:bookworm-slim AS builder

RUN apt-get update
RUN apt-get install -y git bash curl #nodejs

# install nodenv
RUN git clone https://github.com/OiNutter/nodenv /usr/local/nodenv
RUN mkdir -p /usr/local/nodenv/plugins

#ENV PORT="3031"
#ENV ENV="production"
ENV GITHUB_CLIENT_ID="foobar"

ENV NODENV_ROOT="/usr/local/nodenv"
ENV PATH="$NODENV_ROOT/bin:$NODENV_ROOT/shims:$PATH"

RUN git clone https://github.com/nodenv/node-build.git \
    $NODENV_ROOT/plugins/node-build


WORKDIR /app

COPY ./drizzle /app/drizzle
COPY ./src /app/src

COPY ./package.json /app
COPY ./tsconfig.json /app
COPY ./Dockerfile /app
COPY ./drizzle.config.ts /app
COPY ./yarn.lock /app

RUN nodenv install 20.19.0 \
 && nodenv global 20.19.0 \
 && npm i -g yarn \
 && nodenv rehash \
 && yarn install --frozen-lockfile \
 && yarn why @rollup/rollup-linux-arm64-gnu 

WORKDIR /app/src/frontend
RUN yarn install --frozen-lockfile
#RUN yarn why @rollup/rollup-linux-arm64-gnu 

WORKDIR /app

RUN yarn run build:backend 
RUN yarn run build:frontend

COPY ./scripts/entrypoint.sh /app/

ENV DATABASE_URL=""

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
