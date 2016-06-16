#!/usr/bin/env bash
set -e

# copy the TRAVIS_TAG to the more generic 'TAG' var
export TAG=$TRAVIS_TAG

#if [[ $TAG = "nightly" || $TAG =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
#    export BUILD_RELEASE=1
#else
#    export BUILD_RELEASE=0
#fi

export BUILD_RELEASE=0

npm install -g react-native-cli

# Install project
npm install

export PATH=$PATH:./node_modules/.bin

if [[ "$BUILD_TYPE" == "android" ]];then
    echo "Bootstrapping for android"
    source ./build-scripts/android/bootstrap.sh
elif [[ "$BUILD_TYPE" == "ios" ]]; then
    echo "Bootstrapping for ios"
else
    echo "Unknown build type"
fi
