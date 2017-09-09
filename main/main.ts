import {app, globalShortcut} from 'electron';
import inputBox from './inputBox';
import youtube from './commands/youtube';
import newEntry from "./commands/db-new";
import recent from "./commands/db-recent";
import query from "./commands/db-query";

import * as debugManager from "./debugManager";
import * as express from 'express';
import * as path from 'path';

function setup() {
  inputBox();
  youtube();
  newEntry();
  recent();
  query();

  if (!debugManager.debug) {
    let expressApp = express();
    expressApp.set('port', 11337);
    console.log(path.resolve(__dirname));
    expressApp.use(express.static("build"));
    expressApp.listen(expressApp.get('port'));
  }
}

app.on('ready', setup);
app.on('window-all-closed', () => {})
