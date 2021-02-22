const {merge} = require('webpack-merge');

const baseConfig = require('./webpack.preload.config');

module.exports = merge(baseConfig, {
    mode: 'production',
  });