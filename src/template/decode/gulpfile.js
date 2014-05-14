var rendering = require('./rendering');

var gulp = require('gulp');
var _ = require('lodash-node');
var when = require('when/node');

var clean = require('gulp-clean');
var compile = require('gulp-dust');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var render = require('gulp-dust-render');
var phonyVinyl = require('vinyl-source-stream');

var primitives = ['Void', 'Bool', 'UInt8', 'UInt16', 'UInt32', 'UInt64', 'Int8', 'Int16', 'Int32', 'Int64', 'Float32', 'Float64'];

// See issue #238 for dustjs
// dust.optimizers.format = function(ctx, node) { return node }; magic to keep newlines.

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
    return gulp.src('./src/template/decode/**/*.dust')
        .pipe(rename({ extname : "" }))
        .pipe(compile())
        .pipe(concat('precompiled.js'))
        .pipe(insert.prepend('var dust = require("dustjs-linkedin/lib/server");'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('build'));
});

function sstream(text) {
    var s = new stream.Readable(text);
    s._read = function noop() {};
    s.push(text);
    s.push(null);
}

var listTasks = _.map(primitives, function (primitive) { return 'list_' + primitive; });
_(primitives).forEach(function (primitive) {
    gulp.task('list_' + primitive, ['precompiled'], function () {
        return sstream(primitive)
            .pipe(insert.wrap('"', '"'))
            .pipe(insert.wrap('{type:', '}'))
            .pipe(phonyVinyl('List' + primitive))
            .pipe(render(rendering.list.primitive))
            .pipe(rename({ extname: "js" }))
            .pipe(jshint())
            .pipe(jshint.reporter('default'))
            .pipe(gulp.dest('build/list'));
    });
});

gulp.task('listStruct', ['precompiled'], function () {
    return sstream('')
        .pipe(phonyVinyl('ListStruct.js'))
        .pipe(render(rendering.list.Struct))
        .pipe(gulp.dest('build/list'));
});
listTasks.push('listStruct');

gulp.task('listData', ['precompiled'], function () {
    return sstream('')
        .pipe(phonyVinyl('ListData.js'))
        .pipe(render(rendering.list.Data))
        .pipe(gulp.dest('build/list'));
});
listTasks.push('listData');

gulp.task('listText', ['precompiled'], function () {
    return sstream('')
        .pipe(phonyVinyl('ListText.js'))
        .pipe(render(rendering.list.Text))
        .pipe(gulp.dest('build/list'));
});
listTasks.push('listText');

gulp.task('lists', listTasks);
