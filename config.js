module.exports = {
  "flags": {
    "injectTestUrls": false,
    "itemsExpandable": false,
    "itemsSwipable": false
  },

  "settings": {
    "links": {
      "about": "https://trymagnet.org",
      "t&c": "https://trymagnet.org/terms/",
      "privacy": "https://trymagnet.org/privacy/",
      "feedback": "https://trymagnet.org/#contact"
    }
  },

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
    colorPrimary: '#00A2D4',
    fontLightItalic: 'FiraSans-LightItalic',
    fontBook: 'FiraSans-Book'
  },

  "testUrls": [
    "https://facebook.com/mozilla",
    "http://twitter.com/wilsonpage",
    "http://twitter.com/mepartoconmigo",
    "https://en.wikipedia.org/wiki/Ramsay_MacDonald",
    "http://www.bbc.co.uk/news",
    "https://www.youtube.com/watch?v=sBG8O430uOg",
    "https://www.youtube.com/watch?v=ojcNcvb1olg",
    "https://github.com/wilsonpage",
    "https://www.amazon.co.uk/gp/product/B00IE3UR08/",
    // "https://tengam.org/oembed/?url=https%3A%2F%2Fmozilla-magnet.github.io%2Ftwitter-search-embed%2F%3Fhashtag%3Dmozlondon%26widget-id%3D738359369146961920&width=600&height=600",
    // "https://codepen.io/mnmxmx/pen/XdwooQ",
    // "https://play.google.com/store/apps/details?id=org.mozilla.firefox",

    // "https://tengam.org/oembed?width=400&height=400&url=https://mozilla-magnet.github.io/photo-wall-upload-client/",

    // google map
    // "https://tengam.org/oembed?height=400&width=400&url=https%3A%2F%2Fmozilla-magnet.github.io%2Fgoogle-maps%2F%3Furl%3Dhttps%3A%2F%2Fwww.google.com%2Fmaps%2Fd%2Fembed%3Fmid%3D1zhw_RRwsB43UhsrWf3aEaQ7KeKk"
  ]
}
