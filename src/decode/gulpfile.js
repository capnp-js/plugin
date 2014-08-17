var gulp = require('gulp');

//var chug = require('gulp-chug');
var clean = require('gulp-rimraf');
var compile = require('gulp-dust');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
//var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var uglify_ = require('gulp-uglify');

var pretty = {
    mangle : false,
    output : { beautify : true },
    compress : false,
    preserveComments : 'all'
};
var optimal = {};

/*
 * `pretty` introduces errors by separating some return values from their
 * `return` (with gulp-compile preserving whitespace.  Keeping it around for
 * js-doc use later.
 */
var uglify = function () { return uglify_(pretty); };

gulp.task('build', ['precompile']);

//gulp.task('ci', ['test', 'build']);

gulp.task('clean', function () {
    return gulp.src(['./script/templates.js'], {read : false})
        .pipe(clean());
});

/*
gulp.task('test', ['build'], function () {
    return gulp.src('./test/gulpfile.js')
        .pipe(chug({ tasks : ['test'] }))
});
*/

gulp.task('watch', function () {
    gulp.watch([
        './**/*.dust',
        './script/**/*.js'
    ], ['precompile']);
});

gulp.task('precompile', function () {
    return gulp.src('./**/*.dust')
        .pipe(rename({ extname : "" }))
        .pipe(compile({ preserveWhitespace : false }))
        .pipe(concat('templates.js'))
        .pipe(insert.prepend('var dust = require("dustjs-linkedin");'))
        .pipe(gulp.dest('./script/'));
});
