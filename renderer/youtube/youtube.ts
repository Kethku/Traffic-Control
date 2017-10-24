import {ipcRenderer as ipc, remote} from 'electron';

window.onerror = function(error, url, line) {
  ipc.send('errorInWindow', error);
}

ipc.on("mouseMoved", (event: any, newMousePos: {x: number, y: number}) => {
  console.log(JSON.stringify(newMousePos));
  if (document.body != null) {
    document.body.style.clipPath = `polygon(${clipPoly(newMousePos.x, newMousePos.y)})`;
  }
});

function clipPoly(x: number, y: number) {
  var points = [];
  var radius = 200;
  points.push(`0px 0px`);
  points.push(`0px ${window.innerHeight}px`);
  points.push(`${window.innerWidth}px ${window.innerHeight}px`);
  points.push(`${window.innerWidth}px 0px`);
  points.push(`${x}px 0px`);
  for (var i = 0; i <= 30; i++) {
    var theta = i * 2 * Math.PI / 30 - Math.PI / 2;
    points.push(`${x + radius * Math.cos(theta)}px ${y + radius * Math.sin(theta)}px`);
  }
  points.push(`${x}px 0px`);
  return points.join(',');
}

document.addEventListener("DOMContentLoaded", function(event) {
  document.body.style.background = "rgba(0,0,0,0)";
  console.log("Preload run");
});
