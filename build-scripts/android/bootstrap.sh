#!/usr/bin/env bash

export ARTIFACT=android/app/build/outputs/apk/app-release.apk

if [[ $BUILD_RELEASE == 1 ]]; then
    # Get the release keystore from the keystore service
    wget --no-check-certificate https://${TOKEN_SERVICE_USER}:${TOKEN_SERVICE_AUTH_TOKEN}@ci.tengam.org/keystore/magnet-release.keystore

    mkdir -p ~/.gradle
    echo "RELEASE_STORE_FILE=`pwd`/magnet-release.keystore" > ~/.gradle/gradle.properties
    echo "RELEASE_KEY_ALIAS=magnet-release" >> ~/.gradle/gradle.properties
    echo "RELEASE_KEY_PASSWORD=${RELEASE_KEY_PASSWORD}" >> ~/.gradle/gradle.properties
    echo "RELEASE_STORE_PASSWORD=${RELEASE_STORE_PASSWORD}" >> ~/.gradle/gradle.properties
fi
