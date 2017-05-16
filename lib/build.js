'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const api = require('fie-api');

const log = api.log('fie-toolkit-wangpumod');

module.exports = function* (fie, options) {
  if (!fs.existsSync(path.resolve(process.cwd(), 'webpack.config.web.js'))) {
    log.error('未发现 webpack.config.web.js 文件, 先初始化项目在执行build');
    return;
  }

  if (!fs.existsSync(path.resolve(process.cwd(), 'webpack.config.weex.js'))) {
    log.error('未发现 webpack.config.weex.js 文件, 先初始化项目在执行build');
    return;
  }

  log.info('项目打包中...');
  const cli = spawn('gulp', ['build'], {stdio: 'inherit'});

  cli.on('close', function(status) {
    if (status == 0) {
      log.success('打包完成');
    } else {
      log.error('打包失败', status);
    }
  });
};
