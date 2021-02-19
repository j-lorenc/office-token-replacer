const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const baseConfig = require('../webpack.base.config');

module.exports = merge(baseConfig, {
  target: 'electron-main',
  entry: {
    main: './src/main/index.ts',
  },
  output: {
    path: path.resolve(__dirname, '../../..', 'dist/main/'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        enabled: true,
        files: ['./src/main/*.ts?(x)'],
      },
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
});
