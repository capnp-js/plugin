var gulp = require('gulp');

var buffer = require('gulp-buffer');
var concat = require('gulp-concat');
var capnpEval = require('gulp-capnp-eval');
var insert = require('gulp-insert');
var rename = require('gulp-rename');
var render = require('gulp-dust-render');
var tap = require('gulp-tap');
var text2json = require('gulp-capnp-text2json')

gulp.task('test', ['build'], function () {
    return gulp.src('./test/all.js')
        .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('interpreted', function () {
    var reader = require('./readers/myschema');

    return capnpEval('someConst', './schema/myschema.capnp', {format: 'binary'})
        .pipe(dump(reader))
        .pipe(rename({ext : '.json.image'}))
        .pipe(gulp.dest('./schema'));
});

gulp.task('actual', function () {
    return capnpEval('simpleTest', './schema/myschema.capnp')
        .pipe(buffer())
        .pipe(text2json())
        .pipe(rename({extname: '.json'}))
        .pipe(gulp.dest('./schema'));
});

gulp.task('build', ['interpreted', 'actual'], function () {
    var testCase = require('./testCase');

    return gulp.src('./**/*.json')
        .pipe(tap(function (file) {
            file.content = {
                preimage : file.relative,
                image : file.relative + '.image'
            };
        }))
        .pipe(render(testCase))
        .pipe(concat())
        .pipe(insert.wrap(
            'require("assert");describe("Schema readers", function () {',
            '});'
        ))
        .pipe(gulp.dest('./all.js'));
});
