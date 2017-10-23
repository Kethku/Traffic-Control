import {ipcRenderer as ipc, remote} from 'electron';
import * as m from "mithril";
import {Vnode, VnodeDOM} from 'mithril';

let id: string = null;
let mousePos: {x: number, y: number} = null;

ipc.send("ready");
window.onerror = function(error, url, line) {
  ipc.send('errorInWindow', error);
}

ipc.on("showYoutubeVideo", (event: any, youtubeId: string) => {
  id = youtubeId;
  m.redraw();
});

ipc.on("mouseMoved", (event: any, newMousePos: {x: number, y: number}) => {
  mousePos = newMousePos;
  m.redraw();
})

function YoutubePlayer() {
  return {
    view: function() {
      console.log(mousePos);
      var mouseProps: any = {r: 100};
      if (mousePos != null) {
        mouseProps.cx = mousePos.x;
        mouseProps.cy = mousePos.y;
      }
      return m("app", [
        m("svg",
          m("clipPath#clipPath", {clipPathUnits: "objectBoundingBox"},
            m("circle", mouseProps)
           )
         ),
        m("iframe.player", {src: `http://www.youtube.com/embed/${id}?rel=0&autoplay=1&frameborder="0"`, style: {
          clipPath: "url(#clipPath)"
        }})
      ]);
    }
  }
}

m.mount(document.body, YoutubePlayer);
