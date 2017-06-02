import {app, globalShortcut} from 'electron';
import inputBox from './inputBox';
import youtube from './youtube';

function setup() {
  inputBox();
  youtube();
}

app.on('ready', setup);
app.on('window-all-closed', () => {})
