#!/usr/bin/env bash

if [[ $BUILD_RELEASE == 1 ]]; then
    ./build-scripts/deploy-github.js
else
    echo "Skipping deploy, not a release build..."
fi
