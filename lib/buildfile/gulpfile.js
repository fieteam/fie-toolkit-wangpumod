
const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const cwd = argv.h;
const fs = require('fs');
const path = require('path');
const pkg = require(`${cwd}/package.json`);

const gulp = require('gulp');
const gulpRm = require('gulp-rm');
const gulpRename = require('gulp-rename');
const gulpSequence = require('gulp-sequence');
const gulpRaxDebuger = require('gulp-rax-debuger');

const toolUtil = require('../util');
const qrcode = require('qrcode-terminal');
const request = require('sync-request');
const internalIp = require('internal-ip');

const webpack = require('webpack');
const webConfig = require('./webpack.config.web');
const weexConfig = require('./webpack.config.weex');

const currentConfig = toolUtil.getCurrentConfig(cwd);

function resolvePath(relativePath) {
  return path.resolve(cwd, relativePath);
}

let modName = pkg.name;
// 对于老模块，还是需要替换前缀
if (!toolUtil.getProtocolType(modName)) {
  modName = pkg.name.replace(currentConfig.projectName || 'intl-icbu-smod-', '');
}

gulp.task('build:weex', () => {

  webpack(weexConfig, (err, stats) => {

    if (err) {
      console.log(err);
    } else {
      gulp.src([resolvePath('./build/weex.cmd.js')])
      .pipe(gulpRename((pa) => {
        pa.basename = 'weex-index';
      }))
      .pipe(gulp.dest(resolvePath('./build/')))
      .pipe(gulpRaxDebuger({
        projectPath: cwd
      }))
      .pipe(gulp.dest(resolvePath('./build/debuger/')));
    }

    console.log(stats.toString({
      colors: true,
      chunks: false
    }));

  });

});

/**
 * 生成并展示二维码
 */
gulp.task('show:debugercode', () => {
  const baseUrl = `http://${internalIp.v4()}:3000/build/debuger/weex-index.js`;

  const weexBundleUrl = `${baseUrl}?_wx_tpl=${baseUrl}&wh_weex=true`;

  qrcode.generate(weexBundleUrl, {
    small: true
  }, (qr) => {
    console.log(qr);
    console.warn(`Weex: scan above QRCode ${weexBundleUrl} use weex playground.\n`);
  });
});

/**
 * PC打包
 */
gulp.task('build:web', () => {
  webpack(webConfig, (err, stats) => {
    if (err) {
      console.log(err);
    } else {
      console.log(stats.toString({
        colors: true,
        chunks: false
      }));
    }
  });
});

/**
 * build之前清理
 */
gulp.task('build:clean', () => {
  gulp.src(resolvePath('./build/**/*'), {
    read: false
  }).pipe(gulpRm());
});

// PC模块任务
gulp.task('watchpc', () => {
  gulp.watch([resolvePath('./src/web/**/*.js'), resolvePath('./src/web/**/*.scss')], ['build:web']);
});

gulp.task('startpc', ['build:web']);

gulp.task('buildpc', (cb) => {
  gulpSequence(
    'build:clean',
    'build:web',
    'web:babel',
    'web:umd',
    cb
  );
});

// rax模块任务
gulp.task('watchweex', () => {
  gulp.watch([resolvePath('./src/**/*.js'), resolvePath('./src/**/*.css'), resolvePath('./data/weex-mock.json')], ['startweex']);
});

gulp.task('startweex', (cb) => {
  gulpSequence(
    'buildweex',
    'show:debugercode',
    cb
  );
});

gulp.task('buildweex', (cb) => {
  gulpSequence(
    'build:clean',
    'build:weex',
    cb
  );
});
