/**
 * 打包
 */

'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const minimist = require('minimist');
const toolUtil = require('./util.js');

const argv = minimist(process.argv.slice(2));

module.exports = function (fie) {
  if (!fs.existsSync(path.resolve(process.cwd(), './node_modules/@alife/wrapper-sass-loader/index.js'))) {
    fie.logInfo('安装依赖@alife/wrapper-sass-loader');
    spawn.sync('tnpm', ['i', '-D', '@alife/wrapper-sass-loader']);
  }
  if (!fs.existsSync(path.resolve(process.cwd(), './node_modules/@alife/module-globalvar-loader/index.js'))) {
    fie.logInfo('安装依赖@alife/module-globalvar-loader');
    spawn.sync('tnpm', ['i', '-D', '@alife/module-globalvar-loader']);
  }

  // 只打包一个端
  let buildTaskName = '';
  // 判断模块类型
  const protocolType = toolUtil.getProtocolType();

  if (protocolType == 'wl') {
    buildTaskName = 'buildweex';
  } else if (protocolType == 'pc') {
    buildTaskName = 'buildpc';
  } else {
    fie.logError('模块名不符合规范，无法build');
    return false;
  }

  if (argv.pc) {
    buildTaskName = 'buildpc';
  } else if (argv.weex) {
    buildTaskName = 'buildweex';
  }

  fie.logInfo('项目打包中...');

  fie.logInfo(`开始执行 gulp ${buildTaskName} 任务`);

  const execArgs = ['--gulpfile', `${__dirname}/buildfile/gulpfile.js`, '-h', process.cwd()];

  if (argv.debug) {
    execArgs.push('--debug');
  }
  if (argv.global) {
    execArgs.push('--global');
  }

  const cli = spawn('gulp', [buildTaskName, ...execArgs], { stdio: 'inherit' });

  cli.on('close', (status) => {
    if (status === 0) {
      fie.logSuccess('打包成功');
    } else {
      fie.logError('打包失败', status);
    }
  });
};
