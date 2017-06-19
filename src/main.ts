import {app, globalShortcut} from 'electron';
import inputBox from './inputBox';
import youtube from './commands/youtube';
import newEntry from "./commands/db-new";
import recent from "./commands/db-recent";

function setup() {
  inputBox();
  youtube();
  newEntry();
  recent();
}

app.on('ready', setup);
app.on('window-all-closed', () => {})
