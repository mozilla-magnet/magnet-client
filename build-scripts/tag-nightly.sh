#!/usr/bin/env bash

set -e

# Exit early and don't tag if not building a nightly build
if [[ "$NIGHTLY" != "true" ]];then
    echo "Not a nightly build.. skipping tag"
    exit
fi

if [[ "$BUILD_TYPE" != "android" && "$BUILD_TYPE" != "ios" ]]; then
    echo "Invalid BUILD_TYPE, should be 'android' or 'ios'"
    exit -1
else
    export TAG=nightly-${BUILD_TYPE}
fi

if [[ "$TRAVIS" == "true" ]]; then
    git config --global user.name "Travis CI"
    git config --global user.email nobody@mozilla.com
fi

# POST /repos/:owner/:repo/git/tags
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
message="${BUILD_TYPE} nightly - ${timestamp}"

git tag -fam "${message}" ${TAG}

# NOTE!!!! MUST grep or the key is exposed by git output.
git remote add repo \
    https://samgiles:${GITHUB_AUTH_TOKEN}@github.com/mozilla-magnet/magnet-metadata-service.git 2>&1 | grep -v samgiles || true

# First delete the tag
git push repo :${TAG} 2>&1 | grep -v samgiles

# Then create it
git push repo ${TAG}:${TAG} 2>&1 | grep -v samgiles

git remote rm repo
