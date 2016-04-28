#!/usr/bin/env bash

brew reinstall android-sdk

export ANDROID_HOME=$(brew --prefix android-sdk)
export ARTIFACT=android/app/build/outputs/apk/app-release.apk

android=${ANDROID_HOME}/tools/android

# Ensure android sdk is installed
./build-scripts/android/accept-license.expect "$android update sdk --no-ui"

# Ensure android packages are installed
./build-scripts/android/accept-license.expect "./build-scripts/android/install-android-packages.sh"

# Create APK signing variables

# Get the release keystore from the keystore service
wget https://${TOKEN_SERVICE_USER}:${TOKEN_SERVICE_AUTH_TOKEN}@ci.tengam.org/keystore/magnet-release.keystore

mkdir -p ~/.gradle
echo "RELEASE_STORE_FILE=`pwd`/magnet-release.keystore" > ~/.gradle/gradle.properties
echo "RELEASE_KEY_ALIAS=magnet-release" >> ~/.gradle/gradle.properties
echo "RELEASE_KEY_PASSWORD=${RELEASE_KEY_PASSWORD}" >> ~/.gradle/gradle.properties
echo "RELEASE_STORE_PASSWORD=${RELEASE_STORE_PASSWORD}" >> ~/.gradle/gradle.properties
