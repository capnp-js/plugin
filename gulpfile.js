var gulp = require('gulp');

var chug = require('gulp-chug');
var clean = require('gulp-rimraf');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var render = require('gulp-dust-render');
var uglify = require('gulp-uglify');

gulp.task('watch', function () {
    gulp.watch('./src/**/*.js');
    gulp.watch([
         './src/template/decode/**/*',
        '!./src/template/decode/script{,/**}'
    ], ['decode']);
});

gulp.task('build', ['decode']);

gulp.task('decode', ['buildDecode'], function () {
    return gulp.src('./src/decode/script/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('./lib/decode'));
});

gulp.task('buildDecode', function () {
    return gulp.src('./src/decode/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['build'] }))
});

//gulp.task('ci', function () {
//    return gulp.src('./src/decode/gulpfile.js', { read : false })
//        .pipe(chug({ tasks : ['ci'] }));
//});

gulp.task('clean', ['cleanDecode'], function () {
    return gulp.src('./lib/**/*')
        .pipe(clean());
});

gulp.task('cleanDecode', function () {
    return gulp.src('./src/decode/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['clean'] }))
});

var file = require('./lib/decode/file');
gulp.task('generator', function() {
    return gulp.src('./generator/schema.js')
        .pipe(render(file))
//        .pipe(uglify())
        .pipe(rename('reader.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('generator'));
});
