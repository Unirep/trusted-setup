const webpack = require('webpack')

module.exports = {
  mode: 'development',
  entry: './cli.mjs',
  target: 'node',
  experiments: {
    topLevelAwait: true,
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
  ],
}
