import {app, globalShortcut} from 'electron';
import inputBox from './inputBox';

import * as debugManager from "./debugManager";
import * as express from 'express';
import * as path from 'path';

require('source-map-support').install();

function setup() {
  inputBox();

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
