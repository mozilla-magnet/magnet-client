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
    "https://tengam.org/oembed?height=400&width=400&url=https%3A%2F%2Fwww.google.co.uk%2Fmaps%2Fplace%2FMozilla%2F%4051.5103676%2C-0.1292982%2C17z%2Fdata%3D!3m1!4b1!4m5!3m4!1s0x487604cddabe1063%3A0x1c87a03dc31daa0e!8m2!3d51.5103676!4d-0.1271095%3Fhl%3Den&html=%3Ciframe%20data-magnet-required%20src%3D%22https%3A%2F%2Fwww.google.com%2Fmaps%2Fembed%3Fpb%3D!1m18!1m12!1m3!1d2483.1552563495684!2d-0.12929818422990874!3d51.51036757963562!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604cddabe1063%253A0x1c87a03dc31daa0e!2sMozilla!5e0!3m2!1sen!2suk!4v1464883733950%22%2F%3E"
  ]
}
