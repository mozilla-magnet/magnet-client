#!/usr/bin/env bash

set -e
cd android
./gradlew check

if [[ $BUILD_RELEASE == 1 ]]; then
    ./gradlew assembleRelease --info --console plain | tee
else
    ./gradlew build --info --console plain | tee
fi
cd -
