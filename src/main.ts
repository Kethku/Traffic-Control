import {app, BrowserWindow, screen, ipcMain, globalShortcut} from 'electron';
import * as path from 'path';
import * as url from 'url';

let inputBoxWindow: Electron.BrowserWindow;

function hideInputBox() {
  inputBoxWindow.hide();
}

function showInputBox() {
  let display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  inputBoxWindow.setBounds({
    width: display.bounds.width,
    height: display.bounds.height,
    x: display.bounds.x,
    y: display.bounds.y
  });
  inputBoxWindow.show();
}

function createInputBox() {
  inputBoxWindow = new BrowserWindow({
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    thickFrame: true
  });

  inputBoxWindow.loadURL(url.format({
    pathname: path.join(__dirname, "../renderer/build", 'inputBox.html'),
    protocol: 'file:',
    slashes: true
  }));

  inputBoxWindow.setIgnoreMouseEvents(true);
  // inputBoxWindow.webContents.openDevTools({mode: "undocked"});

  inputBoxWindow.on('blur', () => {
    if (!inputBoxWindow.webContents.isDevToolsFocused()) {
      hideInputBox();
    }
  });

  inputBoxWindow.on('closed', hideInputBox);
}

function setup() {
  createInputBox();
  globalShortcut.register('Alt+Space', showInputBox);
}

app.on('ready', setup);
