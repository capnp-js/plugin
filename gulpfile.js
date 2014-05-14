var gulp = require('gulp');

var chug = require('gulp-chug');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');

var primitives = ['Void', 'Bool', 'Float32', 'Float64',
                  'UInt8', 'UInt16', 'UInt32', 'UInt64',
                   'Int8',  'Int16',  'Int32',  'Int64']

gulp.task('watch', function () {
    gulp.watch('./src/**/*.js');
    gulp.watch([
         './src/template/decode/**/*',
        '!./src/template/decode/build{,/**}'
    ], ['decode']);
});

gulp.task('decode', ['buildDecode'], function () {
    return gulp.src('./src/template/decode/build/**/*.js')
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
