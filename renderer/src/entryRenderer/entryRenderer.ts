import m from "mithril";
import {Vnode, VnodeDOM} from 'mithril';
import JSONFormatter from 'json-formatter-js';

let entry: any = null;
let ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on("renderEntry", (entryToRender: any) => {
  alert(entryToRender);
  entry = entryToRender;
  m.redraw();
});

function Properties(props: any) {
  let formatter = new JSONFormatter(props, Infinity);
  return {
    oncreate: function(vnode: VnodeDOM<{},{}>) {
      vnode.dom.appendChild(formatter.render());
    }
  };
}

function Content(content: string) {
  return {
    view: function() {
      return m("p", entry);
    }
  };
}

function Entry() {
  return {
    view: function() {
      if (entry) {
        return m("p", "Loading...");
      } else {
        if (entry.content) {
          let content = entry.content;
          delete entry.content;
          return m("div", [
            Properties(entry),
            Content(content)
          ]);
        }
      }
    }
  }
}

m.mount(document.body, Entry);
ipcRenderer.send("ready");
