const {
  author,
  contributors,
  homepage,
  license,
  name,
  title,
  version,
} = require('./package.json')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const path = require('path')
const webpack = require('webpack')

const devMode = process.env.NODE_ENV !== 'production'

/**
 * @type {webpack.Configuration}
 */
module.exports = {
  entry: {
    embetty: './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: `js/[name].js`,
    filename: '[name].js',
    clean: true,
  },
  devtool: devMode ? 'inline-source-map' : 'nosources-source-map',
  mode: devMode ? 'development' : 'production',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: 'tsconfig.build.json',
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /vertx/,
    }), // see https://github.com/parcel-bundler/parcel/issues/141
    new ForkTsCheckerWebpackPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
    new webpack.BannerPlugin({
      banner: `${title || name} - v${version} - ${new Date().toGMTString()}
${homepage}
Copyright (c) ${new Date().getFullYear()} Heise Medien GmbH & Co. KG
Contributors: ${author.name}, ${contributors.map((c) => c.name).join(', ')}
Licensed under the ${license} license`,
    }),
  ],
}
