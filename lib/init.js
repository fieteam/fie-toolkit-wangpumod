'use strict';

const toolUtil = require('./util');
const _ = require('underscore');
const chalk = require('chalk');
const path = require('path');
const api = require('fie-api');

const npm = api.npm;
const fieFs = api.fs;
const fieUser = api.user;
const fieConfig = api.config;
const log = api.log('fie-toolkit-wangpumod');

module.exports = function* (options) {
  // 当前项目的根目录
  const cwd = toolUtil.getCwd();
  // 当前项目名称集合
  const generateNames = toolUtil.generateNames(cwd.split(path.sep).pop());
  const config = fieConfig.get('toolkitConfig');
  const user = fieUser.getUser() || {};

  fieFs.copyDirectory({
    src: toolUtil.getTemplateDir('root'),
    dist: cwd,
    data: _.extend({}, config, generateNames, {
      author: user.name,
      email: user.email
    }),
    ignore: [
      'node_modules',
      'build',
      '.DS_Store',
      '.idea'
    ],
    sstrReplace: [{
      str: 'developing-project-name',
      replacer: generateNames.fileName
    }{
      str: 'developingClassName',
      replacer: generateNames.className
    }],
    filenameTransformer(name) {
      if (name === '__gitignore') {
        name = '.gitignore';
      } else if (name === '__package.json') {
        name = 'package.json';
      }
      return name;
    }
  });

  log.info('正在安装 npm 依赖...');
  try {
    yield npm.installDependencies();
  } catch (e) {
    log.error(e);
    log.error('tnpm 依赖安装失败');
    log.error('请手动执行 npm i');
  }
  console.log(chalk.yellow('\n--------------------初始化成功,请按下面提示进行操作--------------------\n'));
  console.log(chalk.green(`${chalk.yellow('$ fie start')}         # 可一键开启项目开发环境`));
  console.log(chalk.green(`${chalk.yellow('$ fie help')}          # 可查看当前套件的详细帮助`));
  console.log(chalk.yellow('\n--------------------技术支持: @辟蹊--------------------\n'));
};
