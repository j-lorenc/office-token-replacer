const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const baseConfig = require('../webpack.base.config');

module.exports = merge(baseConfig, {
  target: 'electron-preload',
  entry: {
    preload: './src/preload/index.ts',
  },
  output: {
    path: path.resolve(__dirname, '../../..', 'dist/preload'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.node?$/,
        loader: 'node-loader',
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        enabled: true,
        files: ['./src/preload/*.ts?(x)'],
      },
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
});
