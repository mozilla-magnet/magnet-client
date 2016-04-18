#!/usr/bin/env bash

ANDROID_TARGET_SDK="23"
ANDROID_BUILD_TOOLS_VERSION="23.0.1"

android=${ANDROID_HOME}/tools/android
$android update sdk --no-ui --all --filter "tools,platform-tools,build-tools-${ANDROID_BUILD_TOOLS_VERSION},android-${ANDROID_TARGET_SDK}"
