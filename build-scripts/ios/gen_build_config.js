#!/usr/bin/env node

const config = require('../../config.json');

const prefs = JSON.stringify(Object.keys(config.userFlags)
  .map((key) => {
    return [key, config.userFlags[key].value.toString()];
  }));

const defs =
`
#if DEBUG
let kGaTrackerId = "${config.analyticsTrackerId.development}";
#else
let kGaTrackerId = "${config.analyticsTrackerId.production}";
#endif

let kDefaultPreferences = ${prefs};
let kMetadataServiceUrl = "${config.metadataServiceUrl}";
let kChannelListUrl = "${config.channelListUrl}";
`;

process.stdout.write(defs.trim());
