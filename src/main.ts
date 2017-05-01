import {app, globalShortcut} from 'electron';
import {createInputBox} from './inputBox';

function setup() {
  globalShortcut.register('Alt+Space', createInputBox);
}

app.on('ready', setup);
app.on('window-all-closed', () => {})
