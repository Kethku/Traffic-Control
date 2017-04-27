var gulp = require('gulp');
var shell = require('gulp-shell');
var ts = require('gulp-typescript');
var sass = require('gulp-sass');
var webserver = require('gulp-webserver');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var spawn = require('child_process').spawn;
var electronPath = require('electron');

var mainProject = ts.createProject('tsconfig.json');
var rendererProject = ts.createProject('renderer/tsconfig.json');

var electron;

gulp.task('clean-main', () => {
  del([
    'build/*'
  ]);
});

gulp.task('clean-renderer', () =>  {
  del([
    'renderer/build/*'
  ]);
});

gulp.task('copy-main', () => {
  return gulp.src(['src/**/*', '!src/**/*.ts', '!src/**/*.sass'])
    .pipe(gulp.dest('build'));
});

gulp.task('copy-renderer', () => {
  return gulp.src(['renderer/src/**/*', '!renderer/src/**/*.ts', '!renderer/src/**/*.sass'])
    .pipe(gulp.dest('renderer/build'));
});

gulp.task('build-ts-main', () => {
  return gulp.src('src/**/*.{ts,tsx}')
    .pipe(sourcemaps.init())
    .pipe(mainProject())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
});

gulp.task('build-ts-renderer', () => {
  return gulp.src('renderer/src/**/*.{ts,tsx}')
    .pipe(sourcemaps.init())
    .pipe(rendererProject())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('renderer/build'));
});

gulp.task('build-sass-main', () => {
  return gulp.src('src/**/*.{sass,scss}')
    .pipe(sass())
    .pipe(gulp.dest('build'));
});

gulp.task('build-sass-renderer', () => {
  return gulp.src('renderer/src/**/*.{sass,scss}')
    .pipe(sass())
    .pipe(gulp.dest('renderer/build'));
});

gulp.task('run', shell.task('electron .'));

gulp.task('restart-electron', () => {
  if (electron) {
    electron.kill();
  }
  electron = spawn(electronPath, ['.']);
});

gulp.task('watch', ['rebuild-both'], () => {
  gulp.watch('src/**/*.{ts,tsx}', ['build-ts-main']);
  gulp.watch('renderer/src/**/*.{ts,tsx}', ['build-ts-renderer']);
  gulp.watch('src/**/*.{sass,scss}', ['build-sass-main']);
  gulp.watch('renderer/src/**/*.{sass,scss}', ['build-sass-renderer']);
  gulp.watch(['src/**/*', '!src/**/*.{ts,tsx}', '!src/**/*.{sass,scss}'], ['copy-main']);
  gulp.watch(['renderer/src/**/*', '!renderer/src/**/*.{ts,tsx}', '!renderer/src/**/*.{sass,scss}'], ['copy-renderer']);
});

gulp.task('dev', ['watch'], () => {
  gulp.watch(['build/**/*'], ['restart-electron']);
});

gulp.task('clean-both', ['clean-main', 'clean-renderer']);

gulp.task('copy-both', ['copy-main', 'copy-renderer']);
gulp.task('build-ts-both', ['build-ts-main', 'build-ts-renderer']);

gulp.task('build-both', ['copy-both', 'build-ts-both', 'build-sass-renderer']);

gulp.task('rebuild-both', ['clean-both'], () => {
  return gulp.start('build-both');
});


gulp.task('default', ['rebuild-both']);
