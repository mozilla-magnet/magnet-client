#!/usr/bin/env bash

set -o pipefail

if [[ "$BUILD_TYPE" == "android" ]];then
    cd android
    ./gradlew assembleRelease | tee
    zipalign -c -v 4 $ARTIFACT
elif [[ "$BUILD_TYPE" == "ios" ]]; then
    cd ios
    echo "TODO: Requires code signing authority to build release"
    # xcodebuild -project magnet.xcodeproj -scheme magnet -configuration Release clean build
    cd -
else
    echo "Unknown build type"
    exit -1
fi
