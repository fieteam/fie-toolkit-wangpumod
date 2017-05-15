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
  console.log(chalk.green(`${chalk.yellow('$ fie git create')}    # 可自动在gitlab上创建仓库`));
  console.log(chalk.green(`${chalk.yellow('$ fie git owner')}     # 可将自己添加为仓库的master`));
  console.log(chalk.green(`${chalk.yellow('$ fie help')}          # 可查看当前套件的详细帮助`));
  console.log(chalk.green(`\n建议将现有初始化的代码提交一次到master分支, 方便后续切换到 ${chalk.yellow('daily/x.y.z')} 分支进行开发`));
  console.log(chalk.yellow('\n--------------------技术支持: @辟蹊--------------------\n'));
};
