import {BrowserWindow, screen, ipcMain, globalShortcut} from "electron";
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

  inputBoxWindow.setBounds(display.bounds);

  inputBoxWindow.loadURL(url.format({
    pathname: path.join(__dirname, "../renderer/build/inputBox", 'inputBox.html'),
    protocol: 'file:',
    slashes: true
  }));

  inputBoxWindow.setIgnoreMouseEvents(true);

  inputBoxWindow.on('blur', () => {
    if (!inputBoxWindow.webContents.isDevToolsFocused()) {
      closeInputBox();
    }
  });

  return inputBoxWindow.webContents;
}

export function createDebugInputBox() {
  let contents = createInputBox();
  contents.openDevTools({mode: "detach"});
}

ipcMain.on('hideInputBox', closeInputBox);
ipcMain.on('inputBoxChanged', async (event, currentText) => {
  let completions = await ProduceCompletions.Poll(currentText);
  event.sender.send('completions', completions);
});
ipcMain.on('inputSent', async (event, text) => {
  InputRecieved.Publish(text);
});

export default function setup() {
  globalShortcut.register('Ctrl+Space', createInputBox);
  globalShortcut.register('Ctrl+Alt+Space', createDebugInputBox);
}
