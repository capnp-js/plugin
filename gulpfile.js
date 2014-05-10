var gulp = require('gulp');
var sq = require('streamqueue');

var compile = require('gulp-dust');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');

gulp.task('watch', function () {
    gulp.watch('./src/**/*.js', ['base']);
    gulp.watch([
        './src/template/decode/**/*.dust',
        './src/template/helpers.js'
    ], ['reader']);
    gulp.watch([
        './src/template/encode/**/*.dust',
        './src/template/helpers.js'
    ], ['builder']);
});

gulp.task('base', function () {
    return gulp.src('./src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
});

gulp.task('reader', ['base'], function () {
    // grep for "//" type comments and issue error
    var stream = sq({ objectMode: true });
    stream.queue(gulp.src('./src/template/decode/**/*.dust'));
    stream.queue(gulp.src('./src/template/offset/*.dust', { base : './src/template' }));
    return stream.done()
        .pipe(rename({ extname: "" }))
        .pipe(compile())
        .pipe(concat('reader.js'))
        .pipe(insert.prepend('var dust = require("dustjs-linkedin/lib/server");'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('precompile'));
});

gulp.task('builder', ['base'], function () {
    // grep for "//" type comments and issue error
    var stream = sq({ objectMode: true });
    stream.queue(gulp.src('./src/template/encode/**/*.dust'));
    stream.queue(gulp.src('./src/template/offset/*.dust', { base : './src/template' }));
    return stream.done()
        .pipe(rename({ extname: "" }))
        .pipe(compile())
        .pipe(concat('builder.js'))
        .pipe(insert.prepend('var dust = require("dustjs-linkedin/lib/server");'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('precompile'));
});
