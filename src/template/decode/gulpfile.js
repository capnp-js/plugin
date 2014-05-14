var stream = require('stream');

var gulp = require('gulp');
var gutil = require('gulp-util');
var _ = require('lodash-node');
var when = require('when/node');

var beautify = require('gulp-beautify');
// .pipe(beautify()) after render for pretty-printed modules, but leave it off
// and get a whitespace flag pulled into `dust-compile` for literate bit-
// shiftery (dust.optimizers.format = function(ctx, node) { return node };).

var buffer = require('gulp-buffer');
var clean = require('gulp-clean');
var compile = require('gulp-dust');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var render = require('gulp-dust-render');
var phonyVinyl = require('vinyl-source-stream');

var rendering = require('./rendering');

var primitives = ['Void', 'Bool', 'UInt8', 'UInt16', 'UInt32', 'UInt64', 'Int8', 'Int16', 'Int32', 'Int64', 'Float32', 'Float64'];

gulp.task('clean', function () {
    return gulp.src(['./build/**/*', './precompile/**/*'], {read : false})
        .pipe(clean());
});

gulp.task('watch', function () {
    gulp.watch('./**/*.js', ['base']);
    gulp.watch([
        './decode/**/*.dust',
        './decode/helpers.js'
    ], ['precompiled']);
});

gulp.task('jshint', function () {
    return gulp.src('./**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('precompiled', function () {
    return gulp.src('./**/*.dust')
        .pipe(rename({ extname : "" }))
        .pipe(compile())
        .pipe(concat('precompiled.js'))
        .pipe(insert.prepend('var dust = require("dustjs-helpers");'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('build'));
});

function sstream(text) {
    var s = new stream.Readable(text);
    s._read = function noop() {};
    s.push(text);
    s.push(null);

    return s;
}

var listTasks = _.map(primitives, function (primitive) { return 'list_' + primitive; });
_(primitives).forEach(function (primitive) {
    gulp.task('list_' + primitive, ['precompiled'], function () {
        return sstream(primitive)
            .pipe(phonyVinyl('List' + primitive))
            .pipe(insert.wrap('"', '"'))
            .pipe(insert.wrap('{"type":', '}'))
            .pipe(buffer())
            .pipe(render(rendering.list.primitive))
              .on('error', gutil.log)
            .pipe(beautify())
            .pipe(rename({ extname: ".js" }))
            .pipe(gulp.dest('build/list'));
    });
});

gulp.task('listStruct', ['precompiled'], function () {
    return sstream('')
        .pipe(phonyVinyl('ListStruct.js'))
        .pipe(render(rendering.list.Struct))
        .pipe(beautify())
        .pipe(gulp.dest('build/list'));
});
listTasks.push('listStruct');

gulp.task('listData', ['precompiled'], function () {
    return sstream('')
        .pipe(phonyVinyl('ListData.js'))
        .pipe(render(rendering.list.Data))
        .pipe(beautify())
        .pipe(gulp.dest('build/list'));
});
listTasks.push('listData');

gulp.task('listText', ['precompiled'], function () {
    return sstream('')
        .pipe(phonyVinyl('ListText.js'))
        .pipe(render(rendering.list.Text))
        .pipe(beautify())
        .pipe(gulp.dest('build/list'));
});
listTasks.push('listText');

gulp.task('lists', listTasks);
