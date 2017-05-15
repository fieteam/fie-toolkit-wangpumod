'use strict';

const toolUtil = require('./util');
const fs = require('fs');
const path = require('path');
const api = require('fie-api');

const fieFs = api.fs;
const log = api.log('fie-toolkit-wangpumod');

module.exports = function* (fie, options) {
  const clientArgs = options.clientArgs;
  const type = clientArgs.type;
  const name = clientArgs.name;

  if (type === 'data' || type === 'd') {
    addData(name);
  } else {
    log.error('需要添加的类型错误');
  }
};


/**
 * 添加mock数据
 * 在 data目录下添加一个 x-data.json文件 , 在 apimap.js里面注入一个请求信息
 */
function addData(name) {
  if (!name) {
    log.error('请输入要添加的数据名,多个单词,请使用横杠连接');
    return;
  }

  const allNames = toolUtil.generateNames(name);
  if (fs.existsSync(path.resolve(toolUtil.getCwd(), 'data', `${allNames.fileName}.json`))) {
    log.error('该数据已存在，创建失败');
    return;
  }

  // 复制文件
  fieFs.copyDirectory({
    src: path.resolve(toolUtil.getTemplateDir('data'), 'demo.json'),
    dist: path.resolve(toolUtil.getCwd(), 'data', `${allNames.fileName}.json`),
    data: allNames
  });

  // 注入apiMap
  const apiMapFile = path.resolve(toolUtil.getCwd(), 'src/util/apimap.js');
  if (fs.existsSync(apiMapFile)) {
    fieFs.rewriteFile({
      src: apiMapFile,
      dist: apiMapFile,
      hook: '/* invoke */',
      insertLines: [
        `  ${allNames.varName}: ['/${allNames.fileName}','get'],`
      ]
    });
    log.success(`${apiMapFile} 文件注入成功`);
  }
}

