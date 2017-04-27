import m from "mithril";

function focusOnLoad(vnode: any) {
  vnode.dom.focus();
}

let boxStyle = ".shadow-1.b--none.outline-0.pa3.ma3.f4.w-100"
let inputBox = m("input" + boxStyle, {oncreate: focusOnLoad });

function render() {
  m.render(document.body, inputBox);
}

document.onkeydown = function(evt) {
  var isEscape = false;
  if ("key" in evt) {
    isEscape = (evt.key == "Escape" || evt.key == "Esc");
  } else {
    isEscape = (evt.keyCode == 27);
  }
  if (isEscape) {
    window.close();
  }
};

render();
