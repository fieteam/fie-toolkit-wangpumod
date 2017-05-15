'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const api = require('fie-api');

const log = api.log('fie-toolkit-wangpumod');

module.exports = function* (fie, options) {
  if (!fs.existsSync(path.resolve(process.cwd(), 'webpack.config.js'))) {
    log.error('未发现 webpack.config.js 文件, 可以使用 fie add conf 添加对应版本 webpack 配置文件');
    return;
  }

  log.info('项目打包中...');
  const cli = spawn('./node_modules/.bin/webpack', [
    '--config',
    './webpack.config.js'
  ], { stdio: 'inherit' });

  cli.on('close', (status) => {
    if (status === 0) {
      log.success('打包完成');
      options.callback && options.callback();
    } else {
      log.error('打包失败', status);
    }
  });
};
