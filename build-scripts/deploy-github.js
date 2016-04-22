#!/usr/bin/env node
const fs = require('fs'),
      os = require('os'),
      request = require('request'),
      uritemplate  = require('uri-template'),
      path = require('path');

const repoInfo = {
    org: 'mozilla-magnet',
    repo: 'magnet',
};

const userAgent = "mozmagnet Release-Agent";

const githubAuthToken = process.env.GITHUB_AUTH_TOKEN;

const rootUrl = getRepoUrl();

function getRepoUrl() {
    return `https://api.github.com/repos/${repoInfo.org}/${repoInfo.repo}`;
}

function getNewReleaseUrl() {
    return `${rootUrl}/releases`
}

function getReleaseInfoUrl(tag) {
    return `${rootUrl}/releases/tags/${tag}`;
}

function getUploadReleaseAssetUrl(release, binaryName) {
    const template = uritemplate.parse(release.uploadUrl);
    return template.expand({ name: binaryName, label: binaryName});
}

function getReleaseInfo() {
    const artifact = process.env.ARTIFACT;
    if (!artifact) {
        throw new Error("No ARTIFACT environment variable");
    }

    const tag = process.env.TAG;
    if (!tag) {
        throw new Error("No TAG environment variable");
    }

    return {
        binaryName: path.basename(artifact),
        path: artifact,
        tag: process.env.TAG
    };
}

function uploadBinary() {
  const releaseInfo = getReleaseInfo();

  if(!fs.existsSync(releaseInfo.path)) {
    throw new Error('Error reading file.');
  }

  tryGetReleaseForTag(releaseInfo.tag).then((release) => {
    if (!release) {
        return createRelease({
              tag: releaseInfo.tag,
              name: releaseInfo.tag,
              isPreRelease: true,
        });
    }

    return release;
  }).then((release) => {
      return uploadFileToRelease(release, releaseInfo.binaryName, releaseInfo.path);
  }).catch((e) => {
      setTimeout(function() {
          throw e;
      }, 0);
  });
}

function uploadFileToRelease(release, artifactName, artifactPath) {
    return new Promise(function(resolve, reject) {
        console.log("Uploading file to release...");
        request.post({
          url: getUploadReleaseAssetUrl(release, artifactName),
          headers: {
            'Authorization': `Token ${githubAuthToken}`,
            'User-Agent': userAgent,
            'Content-Type': 'application/octet-stream'
          },
          formData: {
            file: fs.createReadStream(artifactPath)
          }
        }, function(err, res, body) {
            if (err) {
                reject(err);
            }

            if (res.statusCode < 200 || res.statusCode > 299) {
                reject(body);
            }

            const response = JSON.parse(body);
            console.log(response);

            console.log('Binary uploaded successfully.');
            console.log('  - ', response.browser_download_url);
            resolve();
        });
    });
}

function createRelease(options) {
    return new Promise(function(resolve, reject) {
        console.log("Creating a new release for tag: ", options.tag);
        request.post({
            url: getNewReleaseUrl(),
            headers: {
                'Authorization': `Token ${githubAuthToken}`,
                'User-Agent': userAgent
            },
            json: {
                tag_name: options.tag,
                name: options.name,
                prerelease: options.isPreRelease,
            }
        }, function(err, res, body) {
            if (err) {
                reject(err);
            }

            console.log(body);

            if (res.statusCode < 200 || res.statusCode > 299) {
                reject(body);
            }

            console.log("Created release id: ", body.id);
            resolve({ id: body.id, uploadUrl: body.upload_url });
        });
    });
}

function tryGetReleaseForTag(tag) {
    return new Promise(function(resolve, reject) {
        console.log("Looking for release for tag: ", tag);
        request.get({
            url: getReleaseInfoUrl(tag),
            headers: {
                'User-Agent': userAgent,
            }
        }, function(err, res, body) {
            if (err) {
                reject(err);
            }

            if (res.statusCode !== 200) {
                console.log("Release for tag '", tag, "' not found");
                resolve(false);
            }

            const parsedBody = JSON.parse(body);

            resolve({ id: parsedBody.id, uploadUrl: parsedBody.upload_url });
        });

    });
}


function throwFormattedError (err) {
  throw new Error([
    'Error uploading release asset.',
    'The server returned:', "", err].join(os.EOL));
}

uploadBinary();
