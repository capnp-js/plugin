var gulp = require('gulp');
var dust = require('dustjs-linkedin/lib/server');
var compile = require('gulp-dust');
var render = require('gulp-dust-render');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var beautify = require('gulp-beautify');
var sq = require('streamqueue');
var fs = require('fs');

dust.isDebug = true;
dust.debugLevel = 'DEBUG';

//gulp.task('code', function () {
//    
//});

gulp.task('plugin', function() {
    /*
     * Create a runtime environment to interrogate CodeGeneratorRequests from
     * the compiler.
     */
    var schema = require('./src/compile/schema');
    var dust = require('dustjs-helpers');
    require('./dist/decode');         // Add precompiled templates.
    require('./src/compile/helpers'); // Add helpers to `dust` global.

    function name(file) { return 'plugin'; }
    return gulp.src('src/template/plugin.dust')
        .pipe(compile(name))
        .pipe(render(name, schema))
        .pipe(beautify({ indentSize : 4 }))
        .pipe(gulp.dest('dist'));
});

gulp.task('encode', function () {
    // grep for "//" type comments and issue error
    var stream = /*sq*/({ objectMode: true });
    stream.queue(gulp.src('src/template/encode/**/*.dust'));
    stream.queue(gulp.src('src/template/offset/*.dust', { base : 'src/template' }));
    return stream.done()
        .pipe(compile())
        .pipe(concat('encode.js'))
        .pipe(insert.prepend('exports.dust = require("dustjs-linkedin");var dust = exports.dust;'))
        .pipe(gulp.dest('dist'));
});

gulp.task('decode', function () {
    // grep for "//" type comments and issue error
    var stream = sq({ objectMode: true });
    stream.queue(gulp.src('src/template/decode/**/*.dust'));
    stream.queue(gulp.src('src/template/offset/*.dust', { base : 'src/template' }));
    return stream.done()
        .pipe(compile())
        .pipe(concat('decode.js'))
        .pipe(insert.prepend('var dust = require("dustjs-linkedin/lib/server");'))
        .pipe(gulp.dest('dist'));
});
