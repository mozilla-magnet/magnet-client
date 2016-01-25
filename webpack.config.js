module.exports = {
  entry: './www/index.js',
  output: {
    filename: './www/app.built.js'
  },

  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  }
};
