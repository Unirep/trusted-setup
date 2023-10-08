const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const webpack = require('webpack')

module.exports = (env, argv) => ({
  entry: ['./src/index.jsx'],
  mode: 'development',
  devServer: {
    port: 3000,
    historyApiFallback: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      automaticNameDelimiter: '-',
    },
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json'],
    fallback: {
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
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-react'],
        },
      },
      {
        test: /\.(mp4|png|jpg|gif|svg|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.(css)$/,
        // exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new Dotenv({
      systemvars: true,
    }),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html',
      inlineSource: '.(js|css)',
      favicon: 'public/favicon.ico',
      meta: {
        description: {
          name: 'description',
          content:
            'Generate your own verse and help secure the UniRep protocol.',
        },
        keyword: { name: 'keywords', content: 'ZKP, trusted setup, ceremony' },
        'og:title': { property: 'og:title', content: 'UniRep Ceremony' },
        'og:description': {
          property: 'og:description',
          content:
            'Generate your own verse and help secure the UniRep protocol.',
        },
        'og:type': { property: 'og:type', content: 'website' },
        'og:url': { property: 'og:url', content: 'https://ceremony.unirep.io' },
        'og:image': {
          property: 'og:image',
          content: 'https://trusted-setup-og.pages.dev/UniRep-Ceremony-OG.png',
        },
        'twitter:domain': {
          name: 'twitter:domain',
          content: 'ceremony.unirep.io',
        },
        'twitter:card': {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        'twitter:title': { name: 'twitter:title', content: 'UniRep Ceremony' },
        'twitter:description': {
          name: 'twitter:description',
          content:
            'Generate your own verse and help secure the UniRep protocol.',
        },
        'twitter:image': {
          name: 'twitter:image',
          content: 'https://trusted-setup-og.pages.dev/UniRep-Ceremony-OG.png',
        },
      },
    }),
    new MiniCssExtractPlugin(),
    // new HtmlWebpackInlineSourcePlugin(),
    new webpack.DefinePlugin({
      NODE_ENV: `'${argv.mode}'` ?? `'development'`,
      'process.argv': [],
      'process.versions': {},
      'process.versions.node': '"12"',
      process: {
        exit: '(() => {})',
        browser: true,
        versions: {},
        cwd: '(() => "")',
      },
    }),
    new webpack.ProvidePlugin({
      Buffer: path.resolve(__dirname, 'externals', 'buffer.js'),
    }),
    new webpack.ContextReplacementPlugin(/\/maci\-crypto\//, (data) => {
      delete data.dependencies[0].critical
      return data
    }),
  ],
  optimization: {
    minimizer: [`...`, new CssMinimizerPlugin()],
  },
})
