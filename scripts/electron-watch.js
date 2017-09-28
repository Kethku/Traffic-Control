var watch = require('fs').watch;
var spawn = require('child_process').spawn;
var electron = require('electron');

var app;

function restartElectron() {
  if (app != null) {
    app.kill("SIGKILL");
  }
  app = spawn(electron, ['.']);
  app.stdout.pipe(process.stdout);
  app.stderr.pipe(process.stderr);
}
restartElectron();

watch('./build/main.js', (eventType) => {
  if (eventType == "change") {
    restartElectron();
  }
});
