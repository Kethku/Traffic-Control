import m from "mithril";

let ipcRenderer = require('electron').ipcRenderer;

let boxStyle = ".ba.bw1.outline-0.pa3.f4.w-100"
let inputBox = m("input" + boxStyle, {oncreate: focusOnLoad });

function focusOnLoad(vnode: any) {
  vnode.dom.focus();
}

function render() {
  m.render(document.body, inputBox);
}

document.onkeydown = function(evt) {
  var isEscape = false;

  if ("key" in evt) {
    isEscape = evt.key == "Escape" || evt.key == "Esc";
  } else {
    isEscape = evt.keyCode == 27;
  }

  if (isEscape) {
    ipcRenderer.emit("hide");
  }
};

render();
