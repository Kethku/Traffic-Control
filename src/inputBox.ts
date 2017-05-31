import {BrowserWindow, screen, ipcMain} from "electron";
import * as path from 'path';
import * as url from 'url';

import {EventManager1, PollManager1} from "./eventManager";

let inputBoxWindow: Electron.BrowserWindow;

export var InputRecieved = new EventManager1<string>();
export var ProduceCompletions = new PollManager1<string, string>();

export function closeInputBox() {
  if (inputBoxWindow) {
    inputBoxWindow.destroy();
    inputBoxWindow = null;
  }
}

export function createInputBox() {
  closeInputBox();
  let display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  inputBoxWindow = new BrowserWindow({
    skipTaskbar: true,
    transparent: true,
    alwaysOnTop: true,
    thickFrame: true,
    frame: false
  });

  inputBoxWindow.setBounds({
    width: display.bounds.width,
    height: display.bounds.height,
    x: display.bounds.x,
    y: display.bounds.y
  });

  inputBoxWindow.loadURL(url.format({
    pathname: path.join(__dirname, "../renderer/build", 'inputBox.html'),
    protocol: 'file:',
    slashes: true
  }));

  inputBoxWindow.setIgnoreMouseEvents(true);

  inputBoxWindow.on('blur', () => {
    if (!inputBoxWindow.webContents.isDevToolsFocused()) {
      closeInputBox();
    }
  });
}

ipcMain.on('hideInputBox', closeInputBox);
ipcMain.on('inputBoxChanged', (event, currentText) => {
  event.sender.send('completions', ["1", "2", "3"]);
});
