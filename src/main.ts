import {app, globalShortcut} from 'electron';
import inputBox from './inputBox';
import youtube from './commands/youtube';
import newEntry from "./commands/db-new";

function setup() {
  inputBox();
  youtube();
  newEntry();
}

app.on('ready', setup);
app.on('window-all-closed', () => {})
