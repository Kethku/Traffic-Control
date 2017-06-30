var gulp = require("gulp");
var exec = require('child_process').exec;
var ts = require("gulp-typescript");
var webserver = require("gulp-webserver");
var sourcemaps = require("gulp-sourcemaps");
var del = require("del");
var spawn = require("child_process").spawn;
var electronPath = require("electron");

var electron;

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

function buildTasks(name, folder) {
  var tsPaths = {
    src: folder + "src/**/*.ts",
    dest: folder + "build"
  };
  var filePaths = {
    src: [folder + "src/**/*", "!" + tsPaths.src],
    dest: folder + "build"
  };
  var project = ts.createProject(folder + "tsconfig.json");

  function clean(done) {
    del([filePaths.dest]).then(() => done());
  }

  function copy() {
    return gulp.src(filePaths.src)
      .pipe(gulp.dest(filePaths.dest));
  }

  function buildTs() {
    return gulp.src(tsPaths.src)
      .pipe(sourcemaps.init())
      .pipe(project())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(tsPaths.dest));
  }

  function watch() {
    gulp.watch(tsPaths.src, buildTs);
    gulp.watch(filePaths.src, copy);
  }

  gulp.task("clean-" + name, clean);
  gulp.task("copy-" + name, copy);
  gulp.task("build-ts-" + name, buildTs);
  gulp.task("build-" + name, gulp.parallel(copy, buildTs));
  gulp.task("rebuild-" + name, gulp.series(clean, gulp.task("build-" + name)));
  gulp.task("watch-" + name, watch);
}

buildTasks("main", "./");
buildTasks("renderer", "./renderer/");

function run(done) {
  exec("electron .", (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    done(err);
  });
}

function restart(done) {
  if (electron) {
    electron.kill();
  }
  electron = exec("electron .");
  electron.stdout.on('data', (data) => {
    console.log(`stdout: ${data.toString().trim()}`);
  });
  electron.stderr.on('data', (data) => {
    console.log(`stderr: ${data.toString().trim()}`);
  });
  done();
}

function rebuildPackages(done) {
  exec("electron-rebuild", (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    done(err);
  });
}

function watchService() {
  return gulp.watch(["build/**/*.js"], debounce(restart, 3000));
}

gulp.task(run);
gulp.task(restart);

gulp.task("clean", gulp.parallel("clean-main", "clean-renderer"));
gulp.task("rebuild", gulp.series(rebuildPackages, gulp.parallel("rebuild-main", "rebuild-renderer")));
gulp.task("watch", gulp.parallel("watch-main", "watch-renderer", watchService));
gulp.task("dev", gulp.series("clean", "rebuild", gulp.parallel("watch", restart)));

gulp.task("default", gulp.task("rebuild"));
