/**
 * 打开服务器
 */

'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const open = require('open');
const api = require('fie-api');
const fieModule = api.module;

const fieConfig = api.config;
const log = api.log('fie-toolkit-wangpumod');

module.exports = function* () {
  const toolkitConfig = fieConfig.get('toolkitConfig');

  if (!fs.existsSync(path.resolve(process.cwd(), 'webpack.config.web.js'))) {
    log.error('未发现 webpack.config.web.js 文件, 无法运行');
    return;
  }

  if (!fs.existsSync(path.resolve(process.cwd(), 'webpack.config.weex.js'))) {
    log.error('未发现 webpack.config.weex.js 文件, 无法运行');
    return;
  }


  log.info('执行 gulp build');
  let results = spawn.sync('gulp',['build'], {stdio: 'inherit'});

  if (results.status == 0 || results.status == 1) {
    const server = yield fieModule.get('plugin-server');
    yield server.open({}, {
      callback() {
        console.log('---');
        if (toolkitConfig.open) {
          // 开服务器比较慢,给它留点时间buffer
          setTimeout(() => {
            open(`http://localhost:${toolkitConfig.port}/${toolkitConfig.openTarget}`);
          }, 500);
        }
      }
    });
  }
  else {
    log.error('执行 gulp build失败，请检查代码和打包程序');
  }

};
