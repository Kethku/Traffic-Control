import {BrowserWindow, screen, ipcMain as ipc, globalShortcut} from "electron";
import asyncUtils from "./async-utils";
import formatUtils from "./formatUtils";
import pouchManager from "./pouchManager";
import editorManager from "./editorManager";
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

ipc.on('errorInWindow', (event: any, data: any) => {
  console.log(data);
});

ipc.on('closeEntryWindows', () => {
  closeEntries();
})

ipc.on('entryShiftLeft', () => {
  let focusIndex = entryWindows.findIndex(w => w.window.isFocused());
  focusIndex--;
  if (focusIndex < 0) {
    focusIndex = entryWindows.length - 1;
  }
  entryWindows[focusIndex].window.focus();
});

ipc.on('entryShiftRight', () => {
  let focusIndex = entryWindows.findIndex(w => w.window.isFocused());
  focusIndex++;
  if (focusIndex >= entryWindows.length) {
    focusIndex = 0;
  }
  entryWindows[focusIndex].window.focus();
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
  let display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let windowWidth = Math.floor(display.bounds.width / entries.length) - 20;
  let windowHeight = display.bounds.height;
  for (let i = 0; i < entries.length; i++) {
    let entry = entries[i];
    let entryWindow = new BrowserWindow({
      width: windowWidth,
      height: windowHeight,
      x: display.bounds.x + (windowWidth + 20) * i + 10,
      y: Math.floor(display.bounds.y + display.bounds.height * 0.333),
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

    entryWindow.loadURL(url.format({
      pathname: path.join(__dirname, "../renderer/build/entryRenderer", 'entryRenderer.html'),
      protocol: 'file:',
      slashes: true
    }));

    entryWindows.push({window: entryWindow, entry: entry, free: free});
  }
}
