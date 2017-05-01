var gulp = require('gulp');
var shell = require('gulp-shell');
var ts = require('gulp-typescript');
var sass = require('gulp-sass');
var webserver = require('gulp-webserver');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var spawn = require('child_process').spawn;
var electronPath = require('electron');

var electron;

function buildTasks(name, folder) {
  var project = ts.createProject(folder + 'tsconfig.json');
  gulp.task('clean-' + name, () => {
    del([
      folder + 'build/*'
    ]);
  });

  gulp.task('copy-' + name, () => {
    return gulp.src([folder + 'src/**/*', '!' + folder + 'src/**/*.ts', '!' + folder + 'src/**/*.sass'])
      .pipe(gulp.dest(folder + 'build'));
  });

  gulp.task('build-ts-' + name, () => {
    return gulp.src(folder + 'src/**/*.{ts.tsx}')
      .pipe(sourcemaps.init())
      .pipe(project())
      .pipe(sourcemaps.write(folder))
      .pipe(gulp.dest(folder + 'build'));
  });

  gulp.task('build-sass-' + name, () => {
    return gulp.src(folder + 'src/**/*.{sass,scss}')
      .pipe(sass())
      .pipe(gulp.dest(folder + 'build'));
  });

  gulp.task('build-' + name, ['copy-' + name, 'build-ts-' + name, 'build-sass-' + name]);

  gulp.task('rebuild-' + name, ['clean-' + name], () => {
    return gulp.start('build-' + name);
  });

  gulp.task('watch-' + name, ['rebuild-' + name], () => {
    gulp.watch(folder + 'src/**/*.{ts,tsx}', ['build-ts-' + name]);
    gulp.watch(folder + 'src/**/*.{sass,scss}', ['build-sass-' + name]);
    gulp.watch([folder + 'src/**/*', '!' + folder + 'src/**/*.{ts,tsx}', '!' + folder + 'src/**/*.{sass,scss}'], ['copy-' + name]);
  });
}

buildTasks('main', './');
buildTasks('renderer', './renderer/');

gulp.task('run', shell.task('electron .'));

gulp.task('restart-electron', () => {
  if (electron) {
    electron.kill();
  }
  electron = spawn(electronPath, ['.']);
});

gulp.task('rebuild-both', ['rebuild-main', 'rebuild-renderer']);

gulp.task('dev', ['clean-main', 'clean-renderer'], () => {
  gulp.start('watch-main');
  gulp.start('watch-renderer');
  gulp.watch(['build/**/*'], ['restart-electron']);
});


gulp.task('default', ['rebuild-both']);
