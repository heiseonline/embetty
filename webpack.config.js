const {
  author,
  contributors,
  homepage,
  license,
  name,
  title,
  version,
} = require('./package.json')

const path = require('path')
const webpack = require('webpack')

const prod = process.argv.indexOf('-p') !== -1

module.exports = {
  entry: {
    embetty: [
      './polyfills.js',
      './index.js'
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  // devtool: (prod && 'none') || 'eval-source-map',
  devtool: (prod && 'none') || 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /node_modules/,
        exclude: /custom-elements-es5-adapter/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env'],
            plugins: [require('babel-plugin-transform-object-rest-spread')]
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          'to-string-loader',
          {
            loader: 'css-loader'
          },
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: { }
          }
        ]
      },
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/vertx/), // see https://github.com/parcel-bundler/parcel/issues/141
    new webpack.BannerPlugin({
      banner: `${title || name} - v${version} - ${(new Date()).toGMTString()}
${homepage}
Copyright (c) ${(new Date()).getFullYear()} ${author.name}, ${contributors.map(c => c.name).join(', ')}
Licensed under the ${license} license`
    })
  ],
}
