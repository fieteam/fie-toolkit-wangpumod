var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpRename = require('gulp-rename'),
    gulpReplace = require('gulp-replace'),
    gulpRm = require( 'gulp-rm' )
    babel = require('gulp-babel'),
    webpack = require('webpack'),
    pkg = require('./package.json'),
    gulpRaxDebuger = require('gulp-rax-debuger'),
    qrcode = require('qrcode-terminal'),
    internalIp = require('internal-ip'),
    webConfig = require('./webpack.config.web'),
    weexConfig = require('./webpack.config.weex');

gulp.task('build:web', function() {
    webpack(webConfig, function (err, stats) {
        if (err) console.log(err);
        console.log(stats.toString({
            colors: true,
            chunks: false
        }))
    });
});

/**
 * 构建本地开发和装修端调用的代码
 */
gulp.task('bundle:weex', function() {
    webpack(weexConfig, function (err, stats) {
        if (err) {
            console.log(err);
        }
        else {
          gulp.src(['./build/weex.cmd.js'])
              .pipe(gulpRename(function (path) {
                  path.basename = 'weex-index';
              }))
              .pipe(gulp.dest('./build/'));
          gulp.src('./build/weex.cmd.js', {read: false})
              .pipe(gulpRm({ async: false }));
        }
        console.log(stats.toString({
            colors: true,
            chunks: false
        }))
    });
});

gulp.task('generate:weexdebug', function() {
    gulp.src(['./build/weex-index.js'])
        .pipe(gulpRaxDebuger())
        .pipe(gulp.dest('./build/debuger/'))
});

gulp.task('show:debugercode', function() {
    var ip = internalIp.v4();
    var port = 3000;
    var bundleUrl = 'http://' + ip + ':' + port + '/build/debuger/weex-index.js';
    var weexBundleUrl = bundleUrl + '?_wx_tpl=' + bundleUrl;

    qrcode.generate(weexBundleUrl, {small: true});
    console.log('Weex: scan above QRCode ' + weexBundleUrl + ' use weex playground.\n');
});

/**
 * 构建供后端存储，端上调用的代码
 */
gulp.task('build:weex', [], function() {

});

gulp.task('default', function() {
    gulp.watch(['./src/web/*.js','./src/web/*.scss','./src/weex/*.js','./src/weex/*.css','./data/weex-mock.json'], ['bundle:weex', 'build:web', 'build:weex', 'generate:weexdebug']);
});

gulp.task('watch', function() {
    gulp.watch(['./src/web/*.js','./src/web/*.scss','./src/weex/*.js','./src/weex/*.css','./data/weex-mock.json'], ['bundle:weex', 'build:web', 'build:weex', 'generate:weexdebug']);
});

gulp.task('build', ['bundle:weex', 'build:weex', 'build:web', 'generate:weexdebug', 'show:debugercode']);
