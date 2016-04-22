#!/usr/bin/env bash

# Exit early and don't tag if not building a nightly build
if [[ "$NIGHTLY" != "true" ]];then
    echo "Not a nightly build.. skipping tag"
    exit
fi

echo "Tagging nightly"
git config --global user.email "builds@travis-ci.com"
git config --global user.name  "Travis CI"


if [[ "$BUILD_TYPE" != "android" && "$BUILD_TYPE" != "ios" ]]; then
    echo "Invalid BUILD_TYPE, should be 'android' or 'ios'"
    exit -1
else
    export TAG=nightly-${BUILD_TYPE}
fi


# Force new 'git tag'
git tag $TAG -a -m "Nightly - ${BUILD_TYPE}" -f
git push --tags
