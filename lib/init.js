/**
 */

'use strict';

const _ = require('underscore');
const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const chalk = require('chalk');
const toolUtil = require('./util');

module.exports = function (fie) {
  // 获取配置
  const config = fie.getModuleConfig();
  // 当前项目的根目录
  const cwd = toolUtil.getCwd();
  // 当前项目名称集合
  const cwd_list = cwd.split(path.sep);
  const generateNames = toolUtil.generateNames(cwd_list.pop());

  const protocolType = toolUtil.getProtocolType(generateNames.fileName);

  // 默认创建通用模块
  let tplDir = 'common';

  if (protocolType === 'wl') {
    tplDir = 'wireless';
  }

  if (protocolType === 'pc') {
    tplDir = 'pc';
  }

  let piJs = '//g-assets.daily.taobao.net/shopmod/rax-pi/0.0.2/develop.bundle.js';
  let renderCss = '//g-assets.daily.taobao.net/intl-shop/icbu-webmod-render/0.0.6/render.css';
  let renderJs = '//g-assets.daily.taobao.net/intl-shop/icbu-webmod-render/0.0.6/render.js';

  // render根据业务域选择
  switch (generateNames.bizCode) {
    case 'icbu':
      renderCss = '//g.alicdn.com/icbu-decorate/??icbu-mod-lib/0.0.7/index.css,shop-render/0.0.3/pages/index/index.bundle.css';
      renderJs = '//g.alicdn.com/icbu-decorate/??icbu-mod-lib/0.0.7/index.js,shop-render/0.0.3/pages/index/index.js';
      break;
    case 'lazada':
      piJs = '//laz-g-cdn.alicdn.com/lazada-decorate/rax-pi/0.0.20/develop.bundle.js';
      renderCss = '//laz-g-cdn.alicdn.com/lazada-decorate/??lazada-mod-lib/0.0.20/LazadaModLib.min.css,shop-render/2.0.2/pages/index/index.bundle.css';
      renderJs = '//laz-g-cdn.alicdn.com/lazada-decorate/??lazada-mod-lib/0.0.20/LazadaModLib.min.js,shop-render/2.0.2/pages/index/index.js';
      break;
    case 'taobao':
      renderCss = '//g-assets.daily.taobao.net/wangpumod/??wpm-lib/0.0.1/index.css,wpm-render/0.0.1/pages/index/index.css';
      renderJs = '//g-assets.daily.taobao.net/wangpumod/??wpm-lib/0.0.1/index.js,wpm-render/0.0.1/pages/index/index.js';
      break;
    case 'fliggy':
      piJs = '//g-assets.daily.taobao.net/fliggy-shop/rax-pi/0.0.1/develop.bundle.js';
    default:
      break;
  }

  checkProjectName(generateNames.groupName);

  function checkProjectName(groupName) {
    if (toolUtil.checkProjectName(groupName, generateNames.fileName)) {
      config.group = groupName;
      // 启动
      init();
    } else {
      fie.logError(`模块名ss不符合规则，请以${toolUtil.getSpecification(groupName)}开头`);
    }
  }

  function init() {
    fie.dirCopy({
      src: toolUtil.getTemplateDir(tplDir),
      dist: cwd,
      data: _.extend({}, config, generateNames, {
        renderCss,
        renderJs,
        piJs
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
      }, {
        str: 'recommend_itemlist',
        replacer: generateNames.moduleName
      }, {
        str: 'renderCss',
        replacer: renderCss
      }, {
        str: 'renderJs',
        replacer: renderJs
      }, {
        str: 'piJs',
        replacer: piJs
      }, {
        str: 'fileName',
        replacer: generateNames.fileName
      }, {
        str: 'groupName',
        replacer: generateNames.groupName
      }],
      filenameTransformer(name) {
        if (name === '__gitignore') {
          name = '.gitignore';
        }
        return name;
      }
    });

    done();
  }
  /**
   * 创建成功后回调
   * @return {Function} [description]
   */
  function done() {
    // 判断是否有.git,没有的话 则初始化一下
    if (!fs.existsSync(path.join(cwd, '.git'))) {
      fie.logInfo('正在对接 gitlab 仓库 ... ');
      spawn.sync('git', ['init']);
      spawn.sync('git', ['remote', 'add', 'origin', `git@gitlab.alibaba-inc.com:${config.group}/${generateNames.fileName}.git`]);
      // 初始化后提交一把
      spawn.sync('git', ['add', '*']);
      spawn.sync('git', ['commit', '-m', 'init project']);
      spawn.sync('git', ['push', 'origin', 'master']);
    }

    fie.logInfo('正在安装 tnpm 依赖...');
    fie.tnpmInstall((err) => {
      if (err) {
        fie.logError('tnpm 依赖安装失败');
        fie.logError('请手动执行 tnpm ii');
      } else {
        fie.logSuccess('tnpm 依赖安装成功');
        console.log(chalk.yellow('\n--------------------初始化成功,请按下面提示进行操作--------------------\n'));
        console.log(chalk.green(`${chalk.yellow('$ fie start')}          #可一键开启项目开发环境`));
        console.log(chalk.green(`${chalk.yellow('$ fie build')}          #打包模块`));
        console.log(chalk.green(`${chalk.yellow('$ fie publish daily')}  #将模块同步到阿基米德日常环境`));
        console.log(chalk.green(`${chalk.yellow('$ fie publish pre')}    #将模块同步到阿基米德预发环境`));
        console.log(chalk.green(`${chalk.yellow('$ fie publish online')} #发布模块`));
        console.log(chalk.green(`\n建议将现有初始化的代码提交一次到master分支, 方便后续切换到 ${chalk.yellow('daily/x.y.z')} 分支进行开发`));
        console.log(chalk.yellow('\n-------------------- 技术支持: @献之 @方灯 --------------------\n'));
      }
    });
  }
};
