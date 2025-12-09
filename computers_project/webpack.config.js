module.exports = {
  entry: './computers_project/js/laptops.jsx',
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