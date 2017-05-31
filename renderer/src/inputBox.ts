import m from "mithril";

let ipcRenderer = require('electron').ipcRenderer;

let boxStyle = ".bg-gray-transparent.outline-0.ma0.f4.code.w-100.light-silver"

let text = "";
let completions: string[] = [
]
let selectedIndex: number = 0;

function focus(vnode: any) {
  vnode.dom.focus();
}

let Input = {
  view: () => {
    return m("input.pa3.b--none" + boxStyle, {value: text, oncreate: focus, onupdate: focus, onkeyup: m.withAttr("value", (value) => {
      if (value !== text) {
        text = value;
        ipcRenderer.send("inputBoxChanged", value);
      }
    })});
  }
}

let Completions = {
  view: () => {
    let renderedCompletions = [];
    for (let i = 0; i < completions.length; i++) {
      let highlightStyle = "";
      if (i == selectedIndex) {
        highlightStyle = ".bt.bb.bw1.b--white-40";
      }
      renderedCompletions.push(m("div.pa2" + boxStyle + highlightStyle, completions[i]));
    }
    return m('div', renderedCompletions);
  }
}

let InputBar = {
  view: () => {
    return m("div", [
      m(Input),
      m(Completions)
    ]);
  }
}

ipcRenderer.on("completions", (event, newCompletions: string[]) => {
  completions = newCompletions;
  m.redraw();
});

document.onkeydown = function(evt) {
  if (evt.key == "Escape") {
    ipcRenderer.send("hideInputBox");
  } else if (evt.key == "j" && evt.ctrlKey) {
    selectedIndex ++;
    if (selectedIndex > completions.length - 1) {
      selectedIndex = 0;
    }
  } else if (evt.key == "k" && evt.ctrlKey) {
    selectedIndex --;
    if (selectedIndex < 0) {
      selectedIndex = completions.length - 1;
    }
  } else if (evt.key == "Tab") {
    text = completions[selectedIndex];
    m.redraw();
    evt.preventDefault();
  } else if (evt.key == "Enter") {
    ipcRenderer.send("inputSent", text);
  }
};

m.mount(document.body, InputBar);
