#!/usr/bin/env bash

if [[ $TAG = "nightly" || $TAG =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    ./build-scripts/deploy-github.js
else
    echo "Skipping deploy, not a release build..."
fi
