/**
 * 打开服务器
 */

'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const open = require('open');
const api = require('fie-api');

const fieConfig = api.config;
const log = api.log('fie-toolkit-wangpumod');

module.exports = function* () {
  const toolkitConfig = fieConfig.get('toolkitConfig');

  if (!fs.existsSync(path.resolve(process.cwd(), 'webpack.config.js'))) {
    log.error('未发现 webpack.config.js 文件, 可以使用 fie add conf 添加对应版本 webpack 配置文件');
    return;
  }

  process.env.DEV = 1;
  process.env.LIVELOAD = toolkitConfig.liveload ? 1 : 0;
  spawn('./node_modules/.bin/webpack-dev-server', [
    '--config',
    './webpack.config.js',
    '--port',
    toolkitConfig.port
  ], { stdio: 'inherit' });

  if (toolkitConfig.open) {
    // 开服务器比较慢,给它留点时间buffer
    setTimeout(() => {
      open(`http://127.0.0.1:${toolkitConfig.port}/${toolkitConfig.openTarget}`);
    }, 500);
  }
};
