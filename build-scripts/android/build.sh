#!/usr/bin/env bash

set -e
cd android
./gradlew check

if [[ $BUILD_RELEASE == 1 ]]; then
    ./gradlew assembleRelease --info | tee
else
    ./gradlew build --info | tee
fi
cd -
