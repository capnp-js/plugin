var gulp = require('gulp');

var chug = require('gulp-chug');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');

gulp.task('watch', function () {
    gulp.watch('./src/**/*.js');
    gulp.watch([
         './src/template/decode/**/*',
        '!./src/template/decode/build{,/**}'
    ], ['decode']);
});

gulp.task('classes', function () {
    return gulp.src('./src/base/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('./lib/base'));
});

gulp.task('decode', ['buildDecode', 'classes'], function () {
    return gulp.src([
        './src/template/decode/build/**/*.js',
        './src/decode/**/*.js'
    ])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('./lib/decode'));
});

gulp.task('buildDecode', function () {
    return gulp.src('./src/template/decode/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['build'] }))
});

gulp.task('ci', function () {
    return gulp.src('./src/template/decode/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['ci'] }));
});

gulp.task('clean', function () {
    return gulp.src('./decode/**/*')
        .pipe(clean());
});
