'use strict';

const chalk = require('chalk');

module.exports = function* () {
  const help = [
    '',
    'fie-toolkit-wangpumod 使用帮助:  $ fie wangpumod [command]',
    '',
    '  $ fie start               # 开启本地服务器,进行开发调试',
    '  $ fie build               # 打包代码',
    '  $ fie add [type] [name]   # 添加模块',
    '  $ fie test                # 运行单元测试',
    '  $ fie publish [type]      # 发布代码',
    '  $ fie help                # 显示套件帮助信息',
    '',
    '更详细的帮助信息可查看:  http://web.npm.alibaba-inc.com/package/@ali/fie-toolkit-wangpumod',
    ''
  ].join('\r\n');

  process.stdout.write(chalk.green(help));
};
