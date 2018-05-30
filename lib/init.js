/**
 */

'use strict';

const _ = require('underscore');
const path = require('path');
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
      fie.logError(`模块名不符合规则，请以${toolUtil.getSpecification(groupName)}开头`);
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
    console.log(chalk.yellow('\n--------------------初始化成功--------------------\n'));
    console.log(chalk.green(`${chalk.yellow('$ fie start')}          #可一键开启项目开发环境`));
    console.log(chalk.green(`${chalk.yellow('$ fie build')}          #打包模块`));
  }

};
