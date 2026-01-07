#!/bin/sh

API_KEY="${API_KEY:?API_KEY is required}"

[ -z "${API_KEY}" ] && echo "API_KEY is required" && exit 1

echo "Starting go server..."

/app/server

tail -f /dev/null
