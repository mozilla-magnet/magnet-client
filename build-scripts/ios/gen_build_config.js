#!/usr/bin/env node

const config = require('../../config.js');

const defs =
`
#if DEBUG
  #define GA_TRACKER_ID "${config.analyticsTrackerId.development}"
#else
  #define GA_TRACKER_ID "${config.analyticsTrackerId.production}"
#endif
`;

process.stdout.write(defs.trim());
