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
    "https://facebook.com/mozilla",
    // "http://twitter.com/wilsonpage",
    // "http://smc2016.sched.org/venue/Lecture+Theatre",
    // "http://www.bbc.co.uk/news",
    // "https://www.youtube.com/watch?v=sBG8O430uOg",
    "https://www.youtube.com/watch?v=ojcNcvb1olg",
    "https://github.com/wilsonpage",
    "https://mozillalondonallhands2016.sched.org/venue/The+Brasserie",
    //"https://tengam.org/oembed/?url=https%3A%2F%2Fmozilla-magnet.github.io%2Ftwitter-search-embed%2F%3Fhashtag%3Dmozlondon%26widget-id%3D738359369146961920&width=600&height=600",
    // "https://codepen.io/mnmxmx/pen/XdwooQ",
    "https://play.google.com/store/apps/details?id=org.mozilla.firefox",

    // google map
    "https://tengam.org/oembed?height=400&width=400&url=https%3A%2F%2Fmozilla-magnet.github.io%2Fgoogle-maps%2F%3Furl%3Dhttps%3A%2F%2Fwww.google.com%2Fmaps%2Fd%2Fembed%3Fmid%3D1zhw_RRwsB43UhsrWf3aEaQ7KeKk"
  ]
}
