var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpRename = require('gulp-rename'),
    gulpReplace = require('gulp-replace'),
    gulpRm = require( 'gulp-rm' )
    babel = require('gulp-babel'),
    webpack = require('webpack'),
    pkg = require('./package.json'),
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

/**
 * 构建供后端存储，端上调用的代码
 */
gulp.task('build:weex', [], function() {

});

gulp.task('default', function() {
    gulp.watch(['./src/web/*.js','./src/web/*.scss','./pages/weex.js','./src/weex/*.js','./src/weex/*.css'], ['bundle:weex', 'build:web', 'build:weex']);
});

gulp.task('watch', function() {
    gulp.watch(['./src/web/*.js','./src/web/*.scss','./pages/weex.js','./src/weex/*.js','./src/weex/*.css'], ['bundle:weex', 'build:web', 'build:weex']);
});

gulp.task('build', ['bundle:weex', 'build:weex', 'build:web']);
