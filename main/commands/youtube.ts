import {BrowserWindow, screen, ipcMain as ipc, globalShortcut} from "electron";
import * as path from 'path';
import * as url from 'url';
import * as edge from 'edge';

import {InputRecieved, ProduceCompletions} from "../inputBox";
import * as debugManager from "../debugManager";

let youtubeWindow: Electron.BrowserWindow;
let timeout: any = null;
var ctrlDown = false;

var edgeTest = edge.func(`
  async () => {
    return "This is a test of edge.";
  }
`)

edgeTest(null, (error, result) => {
  if (error) console.log(error);
  console.log(result);
});

export function closeYoutubePlayer() {
  if (youtubeWindow) {
    youtubeWindow.destroy();
    youtubeWindow = null;
    clearInterval(timeout);
  }
}
export function createYoutubePlayer(youtubeUrl: string) {
  closeYoutubePlayer();

  let regex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  let results = youtubeUrl.match(regex);
  if (results) {
    var preloadPath = path.join(__dirname, "renderer/youtube/main.js");
    console.log("Preload " + preloadPath);
    youtubeWindow = new BrowserWindow({
      skipTaskbar: true,
      transparent: true,
      alwaysOnTop: true,
      frame: false,
      thickFrame: true,
      show: false,
      webPreferences: {
        preload: preloadPath
      }
    });

    youtubeWindow.once('ready-to-show', () => {
      console.log("youtube ready");
      youtubeWindow.show();
      let display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
      let width = Math.floor(display.bounds.width * 0.25);
      let height = Math.floor(width * 0.5625);
      let bounds = {
        x: display.bounds.x + display.bounds.width - width - 25,
        y: display.bounds.y + display.bounds.height - height - 65,
        width: width, height: height
      };
      youtubeWindow.setContentBounds(bounds);
      youtubeWindow.webContents.send("mouseMoved", {x: -100000, y: -10000});
      youtubeWindow.webContents.openDevTools({mode: "detach"});
    });

    function free() {
      closeYoutubePlayer();
    }

    timeout = setInterval(() => {
      var cursorScreenPoint = screen.getCursorScreenPoint();
      var windowBounds = youtubeWindow.getContentBounds();
      cursorScreenPoint.x -= windowBounds.x;
      cursorScreenPoint.y -= windowBounds.y;
      if (cursorScreenPoint.x > -250 && cursorScreenPoint.x < windowBounds.width + 250 &&
          cursorScreenPoint.y > -250 && cursorScreenPoint.y < windowBounds.height + 250) {
        if (ctrlDown) {
          youtubeWindow.webContents.send("mouseMoved", cursorScreenPoint);
        } else {
          youtubeWindow.webContents.send("mouseMoved", {x: -100000, y: -10000});
        }
      }
    }, 16);

    youtubeWindow.loadURL(`http://www.youtube.com/embed/${results[1]}?rel=0&autoplay=1&frameborder="0"`);
    youtubeWindow.setIgnoreMouseEvents(true);
  }
}

ipc.on('errorInWindow', (event: any, data: any) => {
  console.log(data);
});

export default function setup() {
  ProduceCompletions.Subscribe((text) => {
    if ("youtube ".indexOf(text) != -1 || "yt".indexOf(text) != -1) {
      return "yt {Youtube Video URL}";
    }
  });

  InputRecieved.Subscribe((text) => {
    let regex = /^(yt|youtube) ((.)+)$/;
    let result = text.match(regex);
    if (result) {
      console.log("Running youtube");
      createYoutubePlayer(result[2]);
    }
  });
}
