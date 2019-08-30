const {
  author,
  contributors,
  homepage,
  license,
  name,
  title,
  version,
} = require('./package.json')

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const path = require('path')
const webpack = require('webpack')

const prod = process.argv.indexOf('-p') !== -1

module.exports = {
  entry: {
    embetty: ['./polyfills.js', './index.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  devtool: (prod && 'none') || 'inline-source-map',
  mode: (prod && 'production') || 'development',
  optimization: {
    minimize: false,
  }, // debug`
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /custom-elements-es5-adapter/,
        use: ['cache-loader', 'babel-loader'],
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /^custom-elements-es5-adapter\.js$/,
        use: ['raw-loader'],
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin(/vertx/), // see https://github.com/parcel-bundler/parcel/issues/141
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
    new webpack.BannerPlugin({
      banner: `${title || name} - v${version} - ${new Date().toGMTString()}
${homepage}
Copyright (c) ${new Date().getFullYear()} Heise Medien GmbH & Co. KG
Contributors: ${author.name}, ${contributors.map(c => c.name).join(', ')}
Licensed under the ${license} license`,
    }),
  ],
}
