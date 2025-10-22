module.exports = {
  entry: './js/laptops.jsx',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};