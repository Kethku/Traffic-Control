import * as os from "os";
import * as path from "path";

import * as yaml from "js-yaml";
import asyncUtils from "./async-utils";

export interface Settings {
  user: string,
  pass: string
}

export async function readSettings() {
  return await yaml.load(
    (await asyncUtils.readFile(path.join(os.homedir(), ".dbsettings"))) as string
  ) as Settings;
}
