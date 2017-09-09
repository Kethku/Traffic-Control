export let debug = false;
for (let arg of process.argv) {
  if (arg === '-d' || arg === '--dev') {
    debug = true
  }
}

export let host = "http://localhost:11337";
if (debug) {
  host = "http://localhost:8080";
}
