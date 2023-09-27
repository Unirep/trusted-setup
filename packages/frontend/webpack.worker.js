const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = (env, argv) => ({
  entry: './worker.js',
  // use production to avoid eval()
  mode: 'production',
  target: 'webworker',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json'],
    alias: {
      react: require.resolve('react'),
      mobx: require.resolve('mobx'),
      'mobx-react-lite': require.resolve('mobx-react-lite'),
      // for snarkjs
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      assert: require.resolve('assert/'),
      stream: require.resolve('stream-browserify'),
      os: require.resolve('os-browserify/browser'),
      events: require.resolve('events/'),
      fs: false,
      readline: false,
      constants: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-react'],
        },
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          // publicPath: 'build',
          esModule: false,
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
    new webpack.DefinePlugin({
      NODE_ENV: `'${argv.mode}'` ?? `'development'`,
    }),
  ],
  optimization: {
    minimizer: [`...`, new CssMinimizerPlugin()],
  },
})
