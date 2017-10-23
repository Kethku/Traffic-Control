import {BrowserWindow, screen, ipcMain as ipc, globalShortcut} from "electron";
import * as path from 'path';
import * as url from 'url';

import {InputRecieved, ProduceCompletions} from "../inputBox";
import * as debugManager from "../debugManager";

let youtubeWindow: Electron.BrowserWindow;
let timeout: any = null;

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
    youtubeWindow = new BrowserWindow({
      skipTaskbar: true,
      transparent: true,
      alwaysOnTop: true,
      frame: false,
      thickFrame: true,
      show: true
    });

    function onReady(event: any) {
      console.log("youtube ready");
      if (event.sender === youtubeWindow.webContents) {
        let display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
        let width = Math.floor(display.bounds.width * 0.25);
        let height = Math.floor(width * 0.5625);
        let bounds = {
          x: display.bounds.x + display.bounds.width - width - 25,
          y: display.bounds.y + display.bounds.height - height - 65,
          width: width, height: height
        };
        youtubeWindow.setContentBounds(bounds);
        youtubeWindow.webContents.openDevTools({mode: "detach"});
        youtubeWindow.webContents.send("showYoutubeVideo", results[1]);
      }
    }

    function free() {
      ipc.removeListener('ready', onReady);
      closeYoutubePlayer();
    }

    timeout = setInterval(() => {
      var cursorScreenPoint = screen.getCursorScreenPoint();
      var windowBounds = youtubeWindow.getContentBounds();
      cursorScreenPoint.x -= windowBounds.x;
      cursorScreenPoint.y -= windowBounds.y;
      if (cursorScreenPoint.x > -150 && cursorScreenPoint.x < windowBounds.width + 150 &&
          cursorScreenPoint.y > -150 && cursorScreenPoint.y < windowBounds.height + 150) {
        youtubeWindow.webContents.send("mouseMoved", cursorScreenPoint);
      }
    }, 100);

    ipc.on('ready', onReady);

    youtubeWindow.loadURL(path.join(debugManager.host, "renderer/youtube/youtube.html"));
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
