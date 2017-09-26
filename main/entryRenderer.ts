import {BrowserWindow, screen, ipcMain as ipc, globalShortcut} from "electron";
import asyncUtils from "./async-utils";
import formatUtils from "./formatUtils";
import pouchManager from "./pouchManager";
import editorManager from "./editorManager";
import * as debugManager from "./debugManager";
import * as path from 'path';
import * as url from 'url';

interface EntryWindow {
  window: Electron.BrowserWindow;
  entry: any;
  free: () => void;
}

let entryWindows: EntryWindow[] = [];

export function closeEntries() {
  for (let window of entryWindows) {
    window.free();
  }
  entryWindows = [];
}

export function layoutWindows() {
  let focusIndex = entryWindows.findIndex(w => w.window.isFocused());
  let display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let windowHeight = display.bounds.height - 10;
  let focusedWindowWidth = Math.floor(display.bounds.width * 0.6) - 10;
  let otherWindowWidth = Math.floor((display.bounds.width - 50) * 0.4 / (entryWindows.length - 1)) - 10;
  let currentX = display.bounds.x + 25;
  let currentY = display.bounds.y + 25;
  for (let i = 0; i < entryWindows.length; i++) {
    var entry = entryWindows[i];
    entry.window.setPosition(currentX, currentY);
    if (i == focusIndex) {
      entry.window.setSize(focusedWindowWidth, windowHeight, false);
      currentX += focusedWindowWidth + 10;
    } else {
      entry.window.setSize(otherWindowWidth, windowHeight, false);
      currentX += otherWindowWidth + 10;
    }
  }
}

ipc.on('errorInWindow', (event: any, data: any) => {
  console.log(data);
});

ipc.on('closeAll', closeEntries);

ipc.on('closeEntry', () => {
  let focusIndex = entryWindows.findIndex(w => w.window.isFocused());
  let entryToClose = entryWindows[focusIndex];
  entryToClose.free();
  entryWindows = entryWindows.filter(entry => entry != entryToClose);

  if (focusIndex >= entryWindows.length) {
    focusIndex = 0;
  }
  entryWindows[focusIndex].window.focus();
  layoutWindows();
})

ipc.on('entryShiftLeft', () => {
  let focusIndex = entryWindows.findIndex(w => w.window.isFocused());
  focusIndex--;
  if (focusIndex < 0) {
    focusIndex = entryWindows.length - 1;
  }
  entryWindows[focusIndex].window.focus();
  layoutWindows();
});

ipc.on('entryShiftRight', () => {
  let focusIndex = entryWindows.findIndex(w => w.window.isFocused());
  focusIndex++;
  if (focusIndex >= entryWindows.length) {
    focusIndex = 0;
  }
  entryWindows[focusIndex].window.focus();
  layoutWindows();
});

ipc.on('deleteEntry', async () => {
  let db = await pouchManager.getDb();
  let focusIndex = entryWindows.findIndex(w => w.window.isFocused());
  let entry = entryWindows[focusIndex].entry;
  db.remove(entry);
  entryWindows[focusIndex].window.close();
});

ipc.on('editEntry', async () => {
  let db = await pouchManager.getDb();
  let focusIndex = entryWindows.findIndex(w => w.window.isFocused());
  let entryWindow = entryWindows[focusIndex];
  closeEntries();
  let fileName = "c:/dev/Temp/entry.md";
  try {
    await asyncUtils.writeFile(fileName, formatUtils.produceFile(entryWindow.entry))
  } catch (err) {
    console.log(err);
  }

  await editorManager.editFile(fileName, true);
  let contents = await asyncUtils.readFile(fileName, {encoding: 'utf8'}) as string;
  let json = formatUtils.readFile(contents);
  db.put(json);
})

export function renderEntries(entries: any[]) {
  closeEntries();
  entries = entries.slice(0, 10);
  for (let i = 0; i < entries.length; i++) {
    let entry = entries[i];
    let entryWindow = new BrowserWindow({
      transparent: true,
      thickFrame: true,
      frame: false,
      skipTaskbar: true,
      show: true
    });

    function onReady(event: any) {
      if (event.sender === entryWindow.webContents) {
        entryWindow.webContents.send('renderEntry', entry);
        entryWindow.show();
      }
    }

    function onFocus(event: any) {
      if (event.sender === entryWindow) {
        entryWindow.webContents.send('focus');
      }
    }

    function onBlur(event: any) {
      if (event.sender === entryWindow) {
        entryWindow.webContents.send('blur');
      }
    }

    function free() {
      ipc.removeListener('ready', onReady);
      if (!entryWindow.isDestroyed()) {
        entryWindow.close();
      }
    }

    ipc.on('ready', onReady);

    entryWindow.on('closed', () => {
      entryWindows = entryWindows.filter(w => w.window != entryWindow);
      free();
    });

    entryWindow.on('focus', onFocus);
    entryWindow.on('blur', onBlur);

    entryWindow.loadURL(path.join(debugManager.host, "renderer/entryRenderer/entryRenderer.html"));

    entryWindows.push({window: entryWindow, entry: entry, free: free});
  }
  layoutWindows();
}
