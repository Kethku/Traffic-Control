import {BrowserWindow, screen, ipcMain as ipc, globalShortcut} from "electron";
import asyncUtils from "./async-utils";
import formatUtils from "./formatUtils";
import pouchManager from "./pouchManager";
import * as editorManager from "./editorManager";
import * as debugManager from "./debugManager";
import * as path from 'path';
import * as url from 'url';

const monitorMargin = 50;
const windowBorder = 10;

interface EntryWindow {
  window: Electron.BrowserWindow;
  entry: any;
  free: () => void;
}

let entryWindows: EntryWindow[] = [];
let changesToken: PouchDB.Core.Changes<any> = null;

export function unsubChanges() {
  if (changesToken != null) {
    changesToken.cancel();
    changesToken = null;
  }
}

export function closeEntries() {
  for (let window of entryWindows) {
    window.free();
  }
  entryWindows = [];
  unsubChanges();
}

export function layoutWindows() {
  let focusIndex = entryWindows.findIndex(w => w.window.isFocused());
  let display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let windowHeight = display.bounds.height - windowBorder;
  let focusedWindowWidth = Math.floor((display.bounds.width - ((monitorMargin * 2) - windowBorder)) * 0.6) - windowBorder;
  let otherWindowWidth = Math.floor((display.bounds.width - ((monitorMargin * 2) - windowBorder)) * 0.4 / (entryWindows.length - 1)) - windowBorder;
  let currentX = display.bounds.x + monitorMargin;
  let currentY = display.bounds.y + monitorMargin;
  for (let i = 0; i < entryWindows.length; i++) {
    var entry = entryWindows[i];
    entry.window.setPosition(currentX, currentY);
    if (i == focusIndex) {
      entry.window.setSize(focusedWindowWidth, windowHeight, false);
      currentX += focusedWindowWidth + windowBorder;
    } else {
      entry.window.setSize(otherWindowWidth, windowHeight, false);
      currentX += otherWindowWidth + windowBorder;
    }
  }
}

export async function rerenderEntries() {
  var db = await pouchManager.getDb();
  for (var entryWindow of entryWindows) {
    var newEntry = await db.get(entryWindow.entry._id);
    entryWindow.entry = newEntry;
    entryWindow.window.webContents.send('renderEntry', newEntry);
  }
}

export async function renderEntries(entries: any[]) {
  closeEntries();
  entries = entries.slice(0, 10);
  var db = await pouchManager.getDb();
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

    function handleRedirect(e: any, url: string) {
      if(url != entryWindow.webContents.getURL()) {
        e.preventDefault()
        require('electron').shell.openExternal(url)
      }
    }
    entryWindow.webContents.on('will-navigate', handleRedirect)
    entryWindow.webContents.on('new-window', handleRedirect)

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

  if (entryWindows.length != 0) {
    setTimeout(() => entryWindows[0].window.focus(), 500);
    layoutWindows();
  }

  changesToken = db.changes({
    since: 'now',
    live: true,
    doc_ids: entryWindows.map(entryWindow => entryWindow.entry._id)
  }).on('change', (change) => {
    rerenderEntries();
  });
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

ipc.on('editEntry', () => {
  let focusIndex = entryWindows.findIndex(w => w.window.isFocused());
  let entryWindow = entryWindows[focusIndex];
  editorManager.editTempFile(entryWindow.entry);
});
