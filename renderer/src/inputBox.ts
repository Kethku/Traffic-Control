import m from "mithril";

let ipcRenderer = require('electron').ipcRenderer;

let boxStyle = ".bg-gray-transparent.outline-0.ma0.f4.code.w-100.light-silver"

let completions: string[] = [
]

function renderInput() {
  return m("input.pa3.b--none" + boxStyle, {oncreate: focus, onupdate: focus, onkeyup: m.withAttr("value", (value) => {
    ipcRenderer.send("inputBoxChanged", value);
  })});
}

function renderCompletions() {
  let renderedCompletions = [];
  for (let i = 0; i < completions.length; i++) {
    let highlightStyle = "";
    if (i == 0) {
      highlightStyle = ".bt.bb.bw1.b--white-40";
    }
    renderedCompletions.push(m("div.pa2" + boxStyle + highlightStyle, completions[i]));
  }
  return renderedCompletions
}

function focus(vnode: any) {
  vnode.dom.focus();
}

function render() {
  m.render(document.body, [
    renderInput(),
    renderCompletions()
  ]);
}

ipcRenderer.on("completions", (event, newCompletions: string[]) => {
  completions = newCompletions;
  render();
});

document.onkeydown = function(evt) {
  var isEscape = false;

  if ("key" in evt) {
    isEscape = evt.key == "Escape" || evt.key == "Esc";
  } else {
    isEscape = evt.keyCode == 27;
  }

  if (isEscape) {
    ipcRenderer.send("hideInputBox");
  }
};

render();
