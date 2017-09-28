import {exec} from "child_process"
import {watch} from "fs";
import {join} from "path";
import asyncUtils from "./async-utils";
import formatUtils from "./formatUtils";
import pouchManager from "./pouchManager";

export async function editTempFile(contents: string) {
  let fileName = `c:/dev/Temp/entry${Math.random()}.md`;
  try {
    await asyncUtils.writeFile(fileName, formatUtils.produceFile(contents));
    let editCommand = "emacsclientw -na runemacs.exe -c " + fileName;
    exec(editCommand);
  } catch (err) {
    console.log(err);
  }
}

export var editDir = "c:/dev/Temp/";

watch(editDir, {persistent: false, recursive: false}, async (eventType, fileName) => {
  if (eventType == "change") {
    var filePath = join(editDir, fileName as string);
    console.log(filePath + " changed.");
    let contents = await asyncUtils.readFile(filePath, {encoding: 'utf8'}) as string;
    let json = formatUtils.readFile(contents);
    if ("_id" in json) {
      var db = await pouchManager.getDb();
      try {
        db.put(json);
        await asyncUtils.deleteFile(filePath);
      } catch (err) {}
    }
  }
});

