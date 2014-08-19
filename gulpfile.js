var gulp = require('gulp');

var chug = require('gulp-chug');
var clean = require('gulp-rimraf');
var jshint = require('gulp-jshint');
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
    return gulp.src(['./lib/**/*', './generator/reader.js'], { read : false })
        .pipe(clean());
});

gulp.task('cleanDecode', function () {
    return gulp.src('./src/decode/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['clean'] }))
});

gulp.task('generator', ['types', 'scope', 'constants', 'readers']);

gulp.task('nonscope', ['types', 'constants', 'readers']);

['constants', 'readers', 'types'].forEach(function (processor) {
    gulp.task(processor, function () {
        return gulp.src('./generator/schema.js')
            .pipe(render(
                require('./lib/decode/' + processor)
            ))
            .pipe(uglify())
            .pipe(rename('reader.js'))
            .pipe(jshint())
            .pipe(jshint.reporter('default'))
            .pipe(gulp.dest('generator'));
    });
});

gulp.task('scope', function () {
    return gulp.src('./generator/schema.js')
        .pipe(render(
            require('./lib/decode/scope')
        ))
        .pipe(uglify())
        .pipe(rename('reader.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('generator'));
});
