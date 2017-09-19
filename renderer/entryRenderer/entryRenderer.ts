import * as m from "mithril";
import {Vnode, VnodeDOM} from 'mithril';
import * as showdown from 'showdown';
import vizExtension from './vizExtension';
import katexExtension from './katexExtension';
import * as JSONFormatter from 'json-formatter-js';

import 'katex';

require("./style");
require("./custom");

alert("This is a test.")

let entry: any = null;
let electron = nodeRequire('electron');
let ipc = electron.ipcRenderer;
let remote = electron.remote;
ipc.send("ready");

window.onerror = function(error, url, line) {
 ipc.send('errorInWindow', error);
}

ipc.on("renderEntry", (event: any, entryToRender: any) => {
  entry = entryToRender;
  m.redraw();
});

let action: string = "";
let confirming: boolean = false;

document.onkeydown = function(evt) {
  if (evt.key == "Escape" || evt.key == "q") {
    ipc.send("closeEntryWindows");
  }
  if (evt.key == "h") {
    ipc.send("entryShiftLeft");
  }
  if (evt.key == "l") {
    ipc.send("entryShiftRight");
  }
  if (evt.key == "y" && confirming && action == "delete") {
    ipc.send("deleteEntry");
  }
  if (evt.key == "d") {
    confirming = true;
    action = "delete";
  }
  if (evt.key == "c") {
    ipc.send("editEntry");
  }
  if (evt.key == "x") {
    ipc.send("entryShiftRight");
    window.close();
  }
  if (evt.key == "n") {
    confirming = false;
    action = "";
  }
  m.redraw();
}

function Properties(props: any, collapsed: boolean) {
  let displayLevel = collapsed ? 0 : Infinity;
  let formatter = new JSONFormatter.default.default(props, displayLevel);
  return {
    oncreate: function(vnode: VnodeDOM<{},{}>) {
      vnode.dom.appendChild(formatter.render());
    },
    view: function() {
      return m("div");
    }
  };
}

function Content(content: string) {
  let converter = new showdown.Converter({
    extensions: [katexExtension, vizExtension]
  } as any);
  return {
    view: function() {
      return m.trust(converter.makeHtml(content));
    }
  };
}

function Entry() {
  return {
    view: function() {
      if (entry) {
        if (entry.content) {
          let content = entry.content;
          let properties = JSON.parse(JSON.stringify(entry));
          delete properties.content;
          return m("div", [
            m(Properties(properties, true)),
            m(Content(content))
          ]);
        } else {
          return m(Properties(entry, false));
        }
      } else {
        return m("p", "Loading...");
      }
    }
  }
}

function Renderer() {
  return {
    view: function() {
      if (confirming) {
        return m("h3", "Are you sure?");
      } else {
        let colorClass = remote.getCurrentWindow().isFocused() ? '.bg-white' : '.bg-light-silver'
        return m(colorClass + ".pa3", m(Entry));
      }
    }
  }
}

m.mount(document.body, Renderer);
ipc.on('focus', m.redraw);
ipc.on('blur', m.redraw);
