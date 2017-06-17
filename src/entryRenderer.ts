import {BrowserWindow, screen, ipcMain, globalShortcut} from "electron";
import * as path from 'path';
import * as url from 'url';

let entryWindows: Electron.BrowserWindow[] = [];

export function closeEntries() {
  for (let window of entryWindows) {
    window.close();
  }
  entryWindows = [];
}

export function renderEntries(entries: any[]) {
  let display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let windowWidth = Math.floor(display.bounds.width / entries.length);
  let windowHeight = display.bounds.height;
  for (let i = 0; i < entries.length; i++) {
    let entry = entries[i];
    let entryWindow = new BrowserWindow({
      width: windowWidth,
      height: windowHeight,
      x: display.bounds.x + windowWidth * i,
      y: display.bounds.y,
      show: false
    });

    entryWindow.loadURL(url.format({
      pathname: path.join(__dirname, "../renderer/build/inputBox", 'inputBox.html'),
      protocol: 'file:',
      slashes: true
    }));

    entryWindow.on('ready-to-show', () => {
      entryWindow.webContents.send('renderEntry', entry);
      entryWindow.show();
    });

    entryWindow.on('closed', () => {
      entryWindows = entryWindows.filter(w => w != entryWindow);
    });
  }
}
