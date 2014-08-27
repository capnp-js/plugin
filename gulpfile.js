var gulp = require('gulp');

var chug = require('gulp-chug');
var clean = require('gulp-rimraf');
var jshint = require('gulp-jshint');
var nodefy = require('gulp-nodefy');
var rename = require('gulp-rename');
var render = require('gulp-dust-render');
var uglify_ = require('gulp-uglify');

var pretty = {
    mangle : false,
    output : { beautify : true },
    compress : false,
    preserveComments : 'all'
};
var optimal = {};
var uglify = function () { return uglify_(pretty); };

gulp.task('watch', function () {
    gulp.watch('src/**/*.js');
    gulp.watch([
         'src/template/decode/**/*',
        '!src/template/decode/script{,/**}'
    ], ['reader']);
});

gulp.task('build', ['cgr', 'context']);

gulp.task('reader', ['buildReader'], function () {
    return gulp.src('src/reader/script/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('lib/reader'));
});

gulp.task('builder', ['buildBuilder'], function () {
    return gulp.src('src/builder/script/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('lib/builder'));
});

gulp.task('buildReader', ['sharedTemplates'], function () {
    return gulp.src('src/reader/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['build'] }))
});

gulp.task('buildBuilder', ['sharedTemplates'], function () {
    return gulp.src('src/builder/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['build'] }))
});

//gulp.task('ci', function () {
//    return gulp.src('./src/reader/gulpfile.js', { read : false })
//        .pipe(chug({ tasks : ['ci'] }));
//});

gulp.task('clean', ['cleanReader'], function () {
    return gulp.src('lib', { read : false })
        .pipe(clean());
});

gulp.task('cleanReader', function () {
    return gulp.src('src/reader/gulpfile.js')
        .pipe(chug({ tasks : ['clean'] }))
});

gulp.task('sharedTemplates', function () {
    return gulp.src('./src/shared/**/*.dust')
        .pipe(rename({ extname : "" }))
        .pipe(compile({ preserveWhitespace : false }))
        .pipe(concat('templates.js'))
        .pipe(insert.prepend('var dust = require("capnp-js-plugin-dust");'))
        .pipe(gulp.dest('./src'));
});

gulp.task('cgr', ['rTypes', 'rScope', 'constants', 'readers']);

gulp.task('nonscope', ['rTypes', 'constants', 'readers']);

['constants', 'readers', 'rTypes'].forEach(function (processor) {
    gulp.task(processor, ['reader'], function () {
        return gulp.src('schema/nodes.json')
            .pipe(render(
                require('./lib/reader/' + processor)
            ))
            .pipe(uglify())
            .pipe(rename(processor+'.js'))
            .pipe(jshint())
            .pipe(jshint.reporter('default'))
            .pipe(nodefy())
            .pipe(gulp.dest('lib/cgr'));
    });
});

['builders', 'bTypes'].forEach(function (processor) {
    gulp.task(processor, ['builder'], function () {
        return gulp.src('schema/nodes.json')
            .pipe(render(
                require('./lib/builder/' + processor)
            ))
            .pipe(uglify())
            .pipe(rename(processor+'.js'))
            .pipe(jshint())
            .pipe(jshint.reporter('default'))
            .pipe(nodefy())
            .pipe(gulp.dest('lib/cgr'));
    });
});

gulp.task('rScope', ['reader'], function () {
    return gulp.src('schema/files.json')
        .pipe(render(
            require('./lib/reader/rScope')
        ))
        .pipe(uglify())
        .pipe(rename('rScope.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(nodefy())
        .pipe(gulp.dest('lib/cgr'));
});

gulp.task('context', function () {
    gulp.src('context/**/*.js')
        .pipe(uglify())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(nodefy())
        .pipe(gulp.dest('lib/context'));
});
