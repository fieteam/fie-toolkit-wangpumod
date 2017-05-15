const ExtractTextPlugin = require('extract-text-webpack-plugin');

const DEV = process.env.DEV;
const LIVELOAD = process.env.LIVELOAD;


const config = {
  context: __dirname,
  entry: {
    app: [
      'babel-polyfill',
      './src/app.jsx'
    ]
  },
  output: {
    path: 'build',
    publicPath: 'build',
    filename: '[name].js',
    chunkFilename: '[chunkhash].js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015', 'stage-0']
        }
      }, {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('style', 'css!less')
      }
    ],
  },
  plugins: [
    new ExtractTextPlugin('[name].bundle.css', {
      allChunks: true
    })
  ]
};


if (LIVELOAD) {
  config.entry.app.push('webpack-dev-server/client?/');
}

if (!DEV) {
  // uglify
  // css min
}

module.exports = config;
