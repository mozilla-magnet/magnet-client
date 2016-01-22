  module.exports = [
  {
    entry: './www/index.js',
    output: {
      filename: './www/app.built.js'
    },

    externals: {
      'ble': 'window.ble',
      'zeroconf': 'window.ZeroConf'
    }
  }
];
