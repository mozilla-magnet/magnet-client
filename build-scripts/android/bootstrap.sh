#!/usr/bin/env bash

brew reinstall android-sdk

export ANDROID_HOME=$(brew --prefix android-sdk)
export ARTIFACT=android/app/build/outputs/apk/app-debug.apk

android=${ANDROID_HOME}/tools/android

# Ensure android sdk is installed
./build-scripts/android/accept-license.expect "$android update sdk --no-ui"

# Ensure android packages are installed
./build-scripts/android/accept-license.expect "./build-scripts/android/install-android-packages.sh"
