#!/usr/bin/env bash

if [[ $TAG = "nightly" ]]; then
    ./build-scripts/deploy-github.js
else
    echo "Skipping deploy, not a release build..."
fi
