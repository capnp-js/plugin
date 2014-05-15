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

gulp.task('decode', ['buildDecode'], function () {
    return gulp.src([
        './src/template/decode/build/**/*.js',
        './src/decode/**/*.js'
    ])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('./decode'));
});

gulp.task('buildDecode', function () {
    return gulp.src('./src/template/decode/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['build'] }))
});

gulp.task('clean', function () {
    return gulp.src('./decode/**/*')
        .pipe(clean());
});
