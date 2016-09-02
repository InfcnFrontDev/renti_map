//引入插件
var gulp = require('gulp');
var connect = require('gulp-connect');
var bower = require('gulp-bower');
var livereload = require('gulp-livereload');
var webpack = require('gulp-webpack');


//创建watch任务去检测html文件,其定义了当html改动之后，去调用一个Gulp的Task
gulp.task('watch', function () {
  livereload.listen();
  gulp.watch(['./app/**/*.*','!./app/libs/**/*.*'], function(file){
    livereload.changed(file.path);
  });
});

//使用connect启动一个Web服务器
gulp.task('connect', function () {
  connect.server({
    root: 'app',
    livereload: true
  });
});

//运行Gulp时，默认的Task
gulp.task('default', ['connect', 'watch']);