import {BrowserWindow, screen, ipcMain, globalShortcut} from "electron";
import * as path from 'path';
import * as url from 'url';

import {EventManager1, PollManager1} from "./eventManager";
import * as debugManager from "./debugManager";

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
    frame: false,
    useContentSize: true
  });

  inputBoxWindow.setBounds(display.bounds);
  inputBoxWindow.loadURL(path.join(debugManager.host, "renderer/inputBox/inputBox.html"));
  inputBoxWindow.setIgnoreMouseEvents(true);

  inputBoxWindow.on('blur', () => {
    if (!inputBoxWindow.webContents.isDevToolsFocused()) {
      // closeInputBox();
    }
  });

  return inputBoxWindow;
}

export function createDebugInputBox() {
  let window = createInputBox();
  window.webContents.openDevTools({mode: "detach"});
  window.setSkipTaskbar(false);
}

export default function setup() {
  globalShortcut.register('Ctrl+Space', createInputBox);
  globalShortcut.register('Ctrl+Alt+Space', createDebugInputBox);

  ipcMain.on('hideInputBox', closeInputBox);
  ipcMain.on('inputBoxChanged', async (event: any, currentText: any) => {
    let completions = (await ProduceCompletions.Poll(currentText)).filter(x => x != undefined);
    if (completions) {
      event.sender.send('completions', completions);
    }
  });
  ipcMain.on('inputSent', async (event: any, text: any) => {
    InputRecieved.Publish(text);
  });
}
