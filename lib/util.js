'use strict';

const cwd = process.cwd();
const path = require('path');
const config = require('./config');
const templateDir = path.resolve(__dirname, '../template/');

function firstUpperCase(str) {
  return str.replace(/^\S/, s => s.toUpperCase());
}

function camelTrans(str, isBig) {
  let i = isBig ? 0 : 1;
  str = str.split('-');
  for (; i < str.length; i++) {
    str[i] = firstUpperCase(str[i]);
  }
  return str.join('');
}

const toolUtil = {
  /**
   * 用户输入的是用横杠连接的名字
   * 根据用户输入的name生成各类规格变量名: 横杠连接,小驼峰,大驼峰,全大写
   * {
      fileName: 'intl-icbu-smod-oneImage',
      varName:   'intlIcbuSmodOneImage',
      className: 'IntlIcbuSmodOneImage',
      constName: 'INTLICBUSMODONEIMAGE'
   * }
   */
  generateNames(name, biz) {
    // @方灯
    // 根据文件夹名获取模块type
    // wl- 无线模块
    // pc- PC模块
    const protocolType = this.getProtocolType(name);

    // 做迁移的时候，传入biz配置
    if (!biz) {
      biz = config.biz;
    }

    let bizCode = '';
    let moduleName = '';
    let groupName = '';
    biz.forEach((el) => {
      if (name.indexOf(el.projectName) === 0) {
        bizCode = el.id;
        moduleName = name.replace(el.projectName, '');
        // 如果是新模块，还需要剔除wl-、pc-
        if (protocolType) {
          moduleName = moduleName.replace(`${protocolType}-`, '');
        }
        groupName = el.group;
      }
    });

    return {
      // 横杠连接
      fileName: name,
      moduleName,
      bizCode,
      groupName,
      protocolType,
      // 小驼峰
      varName: camelTrans(name),
      // 大驼峰
      className: camelTrans(name, true),
      // 全大写
      constName: name.split('-').join('').toUpperCase()
    };
  },

  getTemplateDir(type) {
    return type ? path.resolve(templateDir, type) : templateDir;
  },

  getCwd() {
    return cwd;
  },

  getProtocolType(filename) {
    filename = filename || process.cwd().split('/').pop();

    if ((/-wl-/).test(filename)) {
      return 'wl';
    }
    if ((/-pc-/).test(filename)) {
      return 'pc';
    }
    return '';
  },

  checkGroup(group) {
    const biz = config.biz;
    let result = false;
    biz.forEach((el) => {
      if (el.group === group) {
        result = true;
      }
    });
    return result;
  },

  getAllgroup() {
    const biz = config.biz;
    const result = [];
    biz.forEach((el) => {
      if (el.group == 'intl-shopmod') {
        result.push(`${el.group}(${el.id})`);
      } else {
        result.push(el.group);
      }
    });
    return result;
  },
  /**
   * 检测模块group是否符合规范
   * @param  {[type]} group       [description]
   * @param  {[type]} projectName [description]
   * @return {[type]}             [description]
   */
  checkProjectName(group, projectName) {
    const biz = config.biz;
    let result = false;
    biz.forEach((el) => {
      if (el.group === group && projectName.indexOf(el.projectName) === 0) {
        result = true;
      }
    });
    return result;
  },
  /**
   * 获取规范模块名称的前缀
   * @param  {[type]} group [description]
   * @return {[type]}       [description]
   */
  getSpecification(group) {
    const biz = config.biz;
    let result = '';
    biz.forEach((el) => {
      if (el.group === group) {
        result = el.projectName;
      }
    });
    return result;
  },

  getModName(groupName, fileName) {
    const projectName = toolUtil.getSpecification(groupName);
    const tmp = fileName.replace(projectName, '').split('-');

    return tmp.join('_');
  },
  /**
   * 从config中获取到业务bizcode
   * @param  {[type]} fileName [description]
   * @return {[type]}          [description]
   */
  getBizCode(fileName) {
    const biz = config.biz;
    let result = '';
    biz.forEach((el) => {
      if (fileName.indexOf(el.projectName) === 0) {
        result = el.id;
      }
    });
    return result;
  },
  /**
   * 获取模块名称
   * @param  {[type]} fileName [description]
   * @return {[type]}          [description]
   */
  getProjectName(fileName) {
    const biz = config.biz;
    let result = '';
    biz.forEach((el) => {
      if (fileName.indexOf(el.projectName) === 0) {
        result = el.projectName;
      }
    });
    return fileName.replace(result, '');
  },
  /**
   * [getCurrentConfig description]
   * @param  {[type]} cwd [description]
   * @return {
    id: 'paytm',
    group: 'intl-shopmod',
    projectName: 'intl-paytm-smod-'
  }
   */
  getCurrentConfig(newCwd) {
    const cwd_list = newCwd.split(path.sep);
    const generateNames = toolUtil.generateNames(cwd_list.pop());
    const biz = config.biz;
    let currentConfig = {};
    biz.forEach((el) => {
      if ((new RegExp(`^${el.projectName}`)).test(generateNames.fileName)) {
        currentConfig = el;
      }

      // if (generateNames.fileName.indexOf(el.projectName) > -1) {
      //   currentConfig = el;
      // }
    });
    return currentConfig;
  }
};

module.exports = toolUtil;
