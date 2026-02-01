#!/usr/bin/env bash

# Run command 1 in background
yarn build

yarn run dev:frontend &

# Run command 2 in background
(yarn run build:backend && yarn run start) &

wait