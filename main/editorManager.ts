import {exec} from "child_process"
import {watch} from "fs";
import * as path from "path";
import asyncUtils from "./async-utils";
import formatUtils from "./formatUtils";
import pouchManager from "./pouchManager";

var skipList: string[] = [];

export async function editTempFile(contents: any) {
  let fileName = `entry${Math.random()}.md`;
  let filePath = "c:/dev/Temp/" + fileName;
  try {
    skipList.push(fileName);
    await asyncUtils.writeFile(filePath, formatUtils.produceFile(contents));
    let editCommand = "emacsclientw -na runemacs.exe -c " + filePath;
    exec(editCommand);
  } catch (err) {
    console.log(err);
  }
}

export var editDir = "c:/dev/Temp/";

watch(editDir, {persistent: false, recursive: false}, async (eventType, fileName) => {
  if (eventType == "change") {
    if (skipList.indexOf(fileName as string) != -1) {
      skipList = skipList.filter(entry => entry != fileName as string);
    } else {
      if (path.extname(fileName as string) == ".md") {
        var filePath = path.join(editDir, fileName as string);
        console.log(filePath + " changed.");
        let contents = await asyncUtils.readFile(filePath, {encoding: 'utf8'}) as string;
        let json = formatUtils.readFile(contents);
        if ("_id" in json) {
          var db = await pouchManager.getDb();
          try {
            var oldDoc = await db.get(json["_id"]);
            if ("_rev" in oldDoc) {
              json["_rev"] = oldDoc["_rev"];
            }
          } catch (err) {}
          try {
            db.put(json);
            await asyncUtils.deleteFile(filePath);
          } catch (err) {}
        }
      }
    }
  }
});

