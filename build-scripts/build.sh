#!/usr/bin/env bash
set -e
set -o pipefail

if [[ "$BUILD_TYPE" == "android" ]];then
    echo "Building for android"
    source ./build-scripts/android/build.sh
elif [[ "$BUILD_TYPE" == "ios" ]]; then
    echo "Building for ios"
    cd ios
    echo "TODO: Requires code signing authority to build release"
    # xcodebuild -project magnet.xcodeproj -scheme magnet -configuration Release clean build
    cd -
else
    echo "Unknown build type"
fi
