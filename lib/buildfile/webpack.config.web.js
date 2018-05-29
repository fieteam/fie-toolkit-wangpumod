const minimist = require('minimist');
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FusionExternalPlugin = require('@alife/fusion-external-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const argv = minimist(process.argv.slice(2));
const cwd = argv.h;
const moduleName = path.basename(cwd);
const outputPath = path.resolve(cwd, './build');

const extraPlugins = [];
if (!argv.debug) {
  extraPlugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      output: {
        comments: false,
      },
    })
  );
}
if (argv.analyze) {
  extraPlugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerHost: '127.0.0.1',
      analyzerPort: 8888,
      reportFilename: 'report.html',
      defaultSizes: 'parsed',
      openAnalyzer: true,
      generateStatsFile: false,
      statsFilename: 'stats.json',
      statsOptions: null,
      logLevel: 'info',
    })
  );
}

let wrapperSassLoader = `@alife/wrapper-sass-loader?wrap=J_module[module-name=${moduleName}]`;
if (argv.global) {
  wrapperSassLoader = '';
}

module.exports = {

  context: path.resolve(cwd, './'),
  entry: {
    'web-index': [path.resolve(cwd, './src/web/index.js')]
  },
  output: {
    path: outputPath,
    filename: '[name].js?[hash]',
    chunkFilename: '[name].js',
    publicPath: '/build/'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015', 'stage-0']
      }
    }, {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: '@alife/module-globalvar-loader'
    }, {
      test: /\.scss$/,
      exclude: /node_modules/,
      loader: ExtractTextPlugin.extract('style-loader', `css-loader?importLoaders=1&sourceMap!${wrapperSassLoader}!sass-loader`)
    }],
  },
  progress: true,
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.json', '.js', '.jsx'],
    alias: {
      '@alife/next/index.scss': '@alife/next/variables.scss',
      '@alife/icbu-next/index.scss': '@alife/icbu-next/variables.scss',
      '@alife/intl-module-lib/index.scss': '@alife/bc-shop-base/variables.scss',
      '@alife/icbu-mod-lib/index.scss': '@alife/bc-shop-base/variables.scss',
      // common scss
      '@alife/bc-shop-base/index.scss': '@alife/bc-shop-base/variables.scss',
      '@alife/bc-icbu-icon/index.scss': '@alife/bc-shop-base/variables.scss',
    },
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    '@alife/wpm-lib': 'WpmLib',
    '@alife/icbu-mod-lib': 'IcbuModLib',
    '@alife/lazada-mod-lib': 'LazadaModLib',

    'es5-shim': 'returnExports',
    'es5-shim/es5-sham': 'returnExports',
    'es6-shim': 'returnExports',
    'whatwg-fetch': 'fetch',
    'fetch-jsonp': 'returnExports',
    'react-lazyload': 'IcbuModLib.LazyLoad',
    'react-dotdotdot': 'IcbuModLib.Dotdotdot',

    '@alife/intl-module-lib': 'IntlModuleLib',
    '@alife/puck': 'IcbuModLib.puck',
    '@alife/bc-cookie-info': 'IcbuModLib.cookieInfo',
    '@alife/bc-icbu-icon': 'IcbuModLib.IcbuIcon',
    '@alife/bc-alitalk': 'IcbuModLib.bcAlitalk',
  },
  plugins: [
    new ExtractTextPlugin('web-index.css'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    // fusion 外链的方式使用,扩展externals的配置
    new FusionExternalPlugin(),
    ...extraPlugins,
  ]
};
