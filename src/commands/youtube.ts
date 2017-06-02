import {BrowserWindow, screen, ipcMain} from "electron";
import * as path from 'path';
import * as url from 'url';

import {InputRecieved, ProduceCompletions} from "../inputBox";

let youtubeWindow: Electron.BrowserWindow;

export function closeYoutubePlayer() {
  if (youtubeWindow) {
    youtubeWindow.destroy();
    youtubeWindow = null;
  }
}
export function createYoutubePlayer(youtubeUrl: string) {
  closeYoutubePlayer();

  let regex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  let results = youtubeUrl.match(regex);
  if (results) {
    let preloadUrl = path.join(__dirname, "../renderer/build", "youtubePreload.js");

    console.log(preloadUrl);
    youtubeWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: false,
        preload: preloadUrl
      },
      skipTaskbar: true,
      transparent: true,
      alwaysOnTop: true,
      frame: false,
      thickFrame: true,
      show: false
    });
    youtubeWindow.loadURL("http://www.youtube.com/embed/" + results[1] + "?rel=0&autoplay=1");
    youtubeWindow.setIgnoreMouseEvents(true);

    youtubeWindow.on("ready-to-show", () => {
      let display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
      let width = Math.floor(display.bounds.width * 0.25);
      let height = Math.floor(width * 0.5625);
      let bounds = {
        x: display.bounds.x + display.bounds.width - width - 25,
        y: display.bounds.y + display.bounds.height - height - 65,
        width: width, height: height
      };
      youtubeWindow.setContentBounds(bounds);
      youtubeWindow.show();
    })
  }
}

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
      createYoutubePlayer(result[2]);
    }
  });
}
