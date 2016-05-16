#!/usr/bin/env bash
set -e

# copy the TRAVIS_TAG to the more generic 'TAG' var
export TAG=$TRAVIS_TAG

if [[ $TAG = "nightly" || $TAG =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    export BUILD_RELEASE=1
else
    export BUILD_RELEASE=0
fi

npm install -g react-native-cli

# Install project
npm install

export PATH=$PATH:./node_modules/.bin
