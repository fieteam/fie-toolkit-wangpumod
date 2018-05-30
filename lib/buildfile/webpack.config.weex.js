
const argv = require('minimist')(process.argv.slice(2));

const cwd = argv.h;

const path = require('path');
const toolUtil = require('../util');
const webpack = require('webpack');
const RaxWebpackPlugin = require('rax-webpack-plugin');

const pkg = require(path.join(cwd, 'package.json'));

let moduleName = pkg.name;
// 对于老模块，还是需要替换前缀
if (!toolUtil.getProtocolType(moduleName)) {
  moduleName = moduleName
    .replace('@intl-shopmod/intl-icbu-smod-', '')
    .replace('@intl-shopmod/intl-lazada-smod-', '')
    .replace('@intl-shopmod/intl-paytm-smod-', '')
    .replace('wpm-', '');
}

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
// const appDirectory = fs.realpathSync(process.cwd());
function resolveApp(relativePath) {
  return path.resolve(cwd, relativePath);
}

const generateNames = toolUtil.generateNames(moduleName);

const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .map(resolveApp);

const paths = {
  appBuild: resolveApp('build'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appNodeModules: resolveApp('node_modules'),
  nodePaths
};

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = `${cwd}/`;
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
// const publicUrl = '';
const entry = {};

entry['weex.cmd'] = [path.join(paths.appSrc, 'index.js')];

module.exports = {
  target: 'node',

  entry,

  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: paths.appBuild,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: false,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: '[name].js',
    // This is the URL that app is served from. We use "/" in development.
    publicPath
  },
  resolve: {
    fallback: paths.nodePaths,
    extensions: ['.js', '.json', '.jsx', ''],
    alias: {
      react: 'rax'
    }
  },
  plugins: [
    new RaxWebpackPlugin({
      moduleName: generateNames.moduleName,
      externalBuiltinModules: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
      }
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'rax'],
          babelrc: false
        }
      },
      {
        test: /\.css$/,
        loader: 'stylesheet'
      }
    ]
  }
};
