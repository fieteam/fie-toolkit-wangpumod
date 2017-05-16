'use strict';

const chalk = require('chalk');

module.exports = function* () {
  const help = [
    '',
    'fie-toolkit-wangpumod 使用帮助:  $ fie wangpumod [command]',
    '',
    '  $ fie start               # 开启本地服务器,进行开发调试',
    '  $ fie build               # 打包代码',
    '  $ fie publish [type]      # 发布代码',
    '  $ fie help                # 显示套件帮助信息',
    ''
  ].join('\r\n');

  process.stdout.write(chalk.green(help));
};
