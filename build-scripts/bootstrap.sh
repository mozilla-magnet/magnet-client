#!/usr/bin/env bash
set -e

echo "Installing dependencies from brew.."
brew reinstall gradle flow xctool

echo "Installing react-native.."
npm install -g react-native-cli

# Install project
npm install

if [[ "$BUILD_TYPE" == "android" ]];then
    echo "bootstrapping android build.."
    source ./build-scripts/android/bootstrap.sh
elif [[ "$BUILD_TYPE" == "ios" ]]; then
    echo "TODO: bootstrap IOS build"
else
    echo "No BUILD_TYPE specified"
    exit -1
fi
