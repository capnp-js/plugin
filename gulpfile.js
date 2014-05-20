var gulp = require('gulp');

var bump = require('gulp-bump');
var chug = require('gulp-chug');
var clean = require('gulp-clean');
var git = require('gulp-git');
var jshint = require('gulp-jshint');

gulp.task('watch', function () {
    gulp.watch('./src/**/*.js');
    gulp.watch([
         './src/template/decode/**/*',
        '!./src/template/decode/build{,/**}'
    ], ['decode']);
});

gulp.task('decode', ['buildDecode'], function () {
    return gulp.src([
        './src/template/decode/build/**/*.js',
        './src/decode/**/*.js'
    ])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('./decode'));
});

gulp.task('buildDecode', function () {
    return gulp.src('./src/template/decode/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['build'] }))
});

gulp.task('ci', function () {
    return gulp.src('./src/template/decode/gulpfile.js', { read : false })
        .pipe(chug({ tasks : ['ci'] }));
});

gulp.task('clean', function () {
    return gulp.src('./decode/**/*')
        .pipe(clean());
});

/*
 * If username and password break flow, then look over at
 * `http://git-scm.com/docs/gitcredentials.html` to inject.
 */
gulp.task('release', ['bump'], function () {
  var pkg = require('./package.json');
  var v = 'v' + pkg.version;
  var message = 'Release ' + v;

  git.tag(v, message, {}, function () {
      git.push('origin', 'master', '--tags').end();
  });
});

gulp.task('bump', ['incrementVersion'], function () {
    return gulp.src('./package.json')
        .pipe(git.add())
        .pipe(git.commit('Version bump'));
});

gulp.task('incrementVersion', function () {
    return gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'));
});
