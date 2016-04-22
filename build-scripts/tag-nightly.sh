#!/usr/bin/env bash

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

function github_post() {
    # TODO: Use a special account
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Accept: application/vnd.github.v3+json" \
        -d "$2" \
        -u samgiles:${GITHUB_AUTH_TOKEN} \
        https://api.github.com$1
}


# POST /repos/:owner/:repo/git/tags
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
message="${BUILD_TYPE} nightly - ${timestamp}"

body="{
  \"tag\":\"${TAG}\",
  \"message\":\"${message}\",
  \"object\":\"${TRAVIS_COMMIT}\",
  \"type\":\"commit\",
  \"tagger\": {
    \"name\":\"Travis CI\",
    \"email\":\"nobody@mozilla.com\",
    \"data\":\"${timestamp}\"
  }
}"

response=$(github_post /repos/mozilla-magnet/magnet/git/tags "$body")

# Super hack to get the tag reference out of the json response, this may break
# if the API response format changes (install a real json parser?)
TAG_REF=$(echo $response || perl -pe 's/"sha"://; s/^"//; s/",$//; s/"//; s/",//;' | cut -f3 -d" ")

body="{
  \"ref\":\"refs/tags/${TAG}\",
  \"sha\":\"${TRAVIS_COMMIT}\"
}"

github_post /repos/mozilla-magnet/magnet/git/refs "$body"

# Finally ensure the local is tagged to match
git tag -a -m "${message}"
