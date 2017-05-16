var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var outputPath = path.resolve(__dirname, './build');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {

    context: path.resolve(__dirname, './'),
    entry: {
        'web-index': ['./src/web/index.js']
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
              presets: ["react", "es2015", "stage-0"],
              "plugins": [
                  "transform-runtime",
                  "add-module-exports",
                  "transform-decorators-legacy",
                  "transform-react-display-name"
              ]
            }
        }, {
            test: /\.scss$/,
            exclude: /node_modules/,
            loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&sourceMap&localIdentName=[local]_[hash:base64:5]!sass-loader')
        }],
        postLoaders: [{
            test: /\.js$/,
            loaders: ['es3ify-loader']
        }]
    },
    progress: true,
    resolve: {
        modulesDirectories: ['node_modules'],
        extensions: ['', '.json', '.js', '.jsx']
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'classnames/bind': 'classNames',
        'es5-shim': 'returnExports',
        'es5-shim/es5-sham': 'returnExports',
        'console-polyfill': 'console',
        'es6-promise': 'ES6Promise',
        'fetch-ie8': 'fetch'
    },
    plugins: [
        new ExtractTextPlugin('[name].css?[hash]'),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};
