var gulp = require('gulp');

var chug = require('gulp-chug');
var clean = require('gulp-rimraf');
var compile = require('gulp-dust');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var jshint = require('gulp-jshint');
var nodefy = require('gulp-nodefy');
var preprocess = require('gulp-preprocess');
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
    ], ['exportReader']);
});

gulp.task('build', ['cgr', 'context']);

gulp.task('exportReader', ['buildReader'], function () {
    return gulp.src('src/reader/script/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('lib/reader'));
});

gulp.task('exportBuilder', ['buildBuilder'], function () {
    return gulp.src('src/builder/script/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('lib/builder'));
});

gulp.task('buildReader', ['sharedTemplates'], function () {
    return gulp.src('src/reader/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['build'] }));
});

gulp.task('buildBuilder', ['sharedTemplates'], function () {
    return gulp.src('src/builder/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['build'] }));
});

//gulp.task('ci', function () {
//    return gulp.src('./src/reader/gulpfile.js', { read : false })
//        .pipe(chug({ tasks : ['ci'] }));
//});

gulp.task('clean', ['cleanReader'], function () {
    return gulp.src([
        'lib',
        'src/reader/script/sharedTemplates',
        'src/builder/script/sharedTemplates'
    ], { read : false })
        .pipe(clean());
});

gulp.task('cleanReader', function () {
    return gulp.src('src/reader/gulpfile.js')
        .pipe(chug({ tasks : ['clean'] }));
});

gulp.task('cleanBuilder', function () {
    return gulp.src('src/builder/gulpfile.js')
        .pipe(chug({ tasks : ['clean'] }));
});

gulp.task('sharedTemplates', function () {
    return gulp.src('src/shared/**/*.dust')
        .pipe(rename({ extname : "" }))
        .pipe(compile({ preserveWhitespace : false }))
        .pipe(concat('sharedTemplates.js'))
        .pipe(insert.prepend('var dust = require("capnp-js-plugin-dust");'))
        .pipe(gulp.dest('src/reader/script'))
        .pipe(gulp.dest('src/builder/script'));
});

gulp.task('cgr', ['cgrReader', 'cgrBuilder']);
gulp.task('cgrReader', ['rTypes', 'rScope', 'constants', 'readers', 'context']);
gulp.task('cgrBuilder', ['bTypes', 'bScope', 'builders', 'context']);

['constants', 'readers', 'rTypes'].forEach(function (processor) {
    gulp.task(processor, ['exportReader'], function () {
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
    gulp.task(processor, ['exportBuilder'], function () {
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

gulp.task('rScope', ['exportReader'], function () {
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

gulp.task('bScope', ['exportBuilder'], function () {
    return gulp.src('schema/files.json')
        .pipe(render(
            require('./lib/builder/bScope')
        ))
        .pipe(uglify())
        .pipe(rename('bScope.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(nodefy())
        .pipe(gulp.dest('lib/cgr'));
});

gulp.task('context', function () {
    gulp.src('context/**/*.js')
        .pipe(preprocess({ context : {
            TARGET_ENV : 'node'
        }}))
        .pipe(uglify())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(nodefy())
        .pipe(gulp.dest('lib/context'));
});
