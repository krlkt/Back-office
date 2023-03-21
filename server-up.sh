#!/usr/bin/env bash

# this is the script for our docker container to start

set -e # exit if any line fails

npm run build
pm2-runtime npm -- start
