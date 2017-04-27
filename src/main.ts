import {app, BrowserWindow, screen, ipcMain, globalShortcut} from 'electron';
import * as path from 'path';
import * as url from 'url';

let inputBoxWindow: Electron.BrowserWindow;

function closeInputBox() {
  if (inputBoxWindow != null) {
    inputBoxWindow.destroy();
    inputBoxWindow = null;
  }
}

function createInputBox() {
  closeInputBox();
  let display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let cx = display.bounds.x + display.bounds.width / 2;
  let cy = display.bounds.y + display.bounds.height / 2;
  let width = display.bounds.width * 0.8;
  let height = display.bounds.height;

  inputBoxWindow = new BrowserWindow({width: width, height: height * 3 / 4, frame: false, transparent: true, x: cx - (width / 2), y: cy - (height * 3 / 8)});

  inputBoxWindow.loadURL(url.format({
    pathname: path.join(__dirname, "../renderer/build", 'inputBox.html'),
    protocol: 'file:',
    slashes: true
  }));

  inputBoxWindow.setIgnoreMouseEvents(true);
  // inputBoxWindow.webContents.openDevTools({mode: "undocked"});

  inputBoxWindow.on('blur', () => {
    if (!inputBoxWindow.webContents.isDevToolsFocused()) {
      closeInputBox();
    }
  });

  inputBoxWindow.on('closed', closeInputBox);
}

ipcMain.on("", (args) => {

});

function setup() {
  globalShortcut.register('Alt+`', () => {
    createInputBox();
  });
}


app.on('ready', setup);
app.on('window-all-closed', () => {

})
