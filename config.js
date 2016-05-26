module.exports = {
  "metadataServiceUrl": "https://tengam.org/api/v1/metadata",

  "adaptors": [
    {
      "pattern": "^https?\:\/\/?(?:www\.)?facebook\.com\/.+$",
      "url": "http://box.wilsonpage.me/magnet-facebook-adaptor"
    },
    {
      "pattern": "^https?\:\/\/?(?:www\.)?twitter\.com\/.+$",
      "url": "http://box.wilsonpage.me/magnet-twitter-adaptor"
    },
    {
      "pattern": "^https?:\/\/play\.google\.com\/store\/apps\/details",
      "url": "http://box.wilsonpage.me/magnet-playstore-adaptor"
    },
    {
      "pattern": "^https?:\/\/(?:[^\.]+)\.sched\.org\/venue\/",
      "url": "https://tengam.org/adaptors/sched/"
    }
  ],

  theme: {
    colorBackground: '#f2f2f2',
    colorPrimary: '#00A2D4'
  },

  "injectTestUrls": false,
  "testUrls": [
    // "https://facebook.com/mozilla",
    // "http://twitter.com/wilsonpage",
    // "http://smc2016.sched.org/venue/Lecture+Theatre",
    "http://www.bbc.co.uk/news",
    "https://www.youtube.com/watch?v=sBG8O430uOg",
    "https://github.com/wilsonpage",
    "https://mozillalondonallhands2016.sched.org/venue/The+Brasserie",
    // "https://codepen.io/mnmxmx/pen/XdwooQ",
    // "https://play.google.com/store/apps/details?id=org.mozilla.firefox"
  ]
}
