import * as moment from "moment";
import asyncUtils from "../async-utils";
import editorManager from "../editorManager";
import pouchManager from "../pouchManager";
import formatUtils from "../formatUtils";
import {InputRecieved, ProduceCompletions} from "../inputBox";

export async function newEntry(tag?: string) {
  let db = await pouchManager.getDb();
  let now = moment.utc().valueOf();
  let fileName = "c:/dev/Temp/entry.md";
  let entryName = now.toString();
  let entryData: any = { };
  if (tag) entryData[tag] = "";
  let entry: any = {};
  entry[entryName] = entryData;
  try {
    await asyncUtils.writeFile(fileName, formatUtils.produceFile(entry));
  } catch (err) {
    console.log(err);
  }

  await editorManager.editFile(fileName);
  let contents = await asyncUtils.readFile(fileName, "utf8") as string;
  db.put(formatUtils.readFile(contents));
}

export default function setup() {
  ProduceCompletions.Subscribe((text) => {
    if ("new ".indexOf(text) != -1) {
      return "new {Optional Tag Name}";
    }
  });

  InputRecieved.Subscribe((text) => {
    let regex = /^new( (.)+)?$/;
    let result = text.match(regex);
    newEntry(result[1]);
  })
}
