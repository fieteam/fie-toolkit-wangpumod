/**
 * 打开服务器
 */

'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const minimist = require('minimist');
const toolUtil = require('./util.js');

const argv = minimist(process.argv.slice(2));

module.exports = function* (fie) {
  const sdkConfig = fie.getModuleConfig();

  const protocolType = toolUtil.getProtocolType();

  if (protocolType === 'pc' && !fs.existsSync(path.resolve(process.cwd(), './node_modules/@alife/wrapper-sass-loader/index.js'))) {
    fie.logInfo('安装依赖@alife/wrapper-sass-loader');
    spawn.sync('tnpm', ['i', '-D', '@alife/wrapper-sass-loader']);
  }
  if (protocolType === 'pc' && !fs.existsSync(path.resolve(process.cwd(), './node_modules/@alife/module-globalvar-loader/index.js'))) {
    fie.logInfo('安装依赖@alife/module-globalvar-loader');
    spawn.sync('tnpm', ['i', '-D', '@alife/module-globalvar-loader']);
  }
  if (protocolType === 'pc' && !fs.existsSync(path.resolve(process.cwd(), './node_modules/es3ify-loader'))) {
    fie.logInfo('安装依赖es3ify-loader');
    spawn.sync('tnpm', ['i', '-D', 'es3ify-loader']);
  }

  fie.getFieModule('fie-plugin-server', (err, server) => {
    if (err) {
      throw err;
    }

    // 定义start、watch任务名
    let startTaskName = '';
    let watchTaskName = '';

    // 判断模块类型
    const protocolType = toolUtil.getProtocolType();

    if (protocolType == 'wl') {
      startTaskName = 'startweex';
      watchTaskName = 'watchweex';
    } else if (protocolType == 'pc') {
      startTaskName = 'startpc';
      watchTaskName = 'watchpc';
    } else {
      fie.logError('模块名不符合规范，无法启动本地开发');
      return false;
    }

    if (argv.pc) {
      startTaskName = 'startpc';
      watchTaskName = 'watchpc';
    } else if (argv.weex) {
      startTaskName = 'startweex';
      watchTaskName = 'watchweex';
    }

    const execArgs = ['--gulpfile', `${__dirname}/buildfile/gulpfile.js`, '-h', process.cwd()];

    if (argv.debug) {
      execArgs.push('--debug');
    }
    if (argv.global) {
      execArgs.push('--global');
    }
    if (argv.analyze) {
      execArgs.push('--analyze');
    }

    fie.logInfo(`开始执行 gulp ${startTaskName} 任务`);

    const spawnRet = spawn('gulp', [startTaskName, ...execArgs], { stdio: 'inherit' });

    spawnRet.on('close', (status) => {
      if (status === 0) {
        const s = server.open(fie, {
          config: sdkConfig,
          callback: () => {
            fie.logSuccess(`gulp ${startTaskName} 任务执行成功`);

            fie.logSuccess('本地服务器启动成功，gulp-watch任务监听中');

            spawn('gulp', [watchTaskName, ...execArgs], { stdio: 'inherit' });
          }
        });
        s.next();
      } else {
        fie.logError('启动失败', status);
      }
    });
  });
};
