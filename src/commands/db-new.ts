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
  let entry: any = { };
  if (tag) entry[tag] = "";
  entry["_id"] = entryName
  try {
    await asyncUtils.writeFile(fileName, formatUtils.produceFile(entry));
  } catch (err) {
    console.log(err);
  }

  await editorManager.editFile(fileName, true);
  let contents = await asyncUtils.readFile(fileName, "utf8") as string;
  let json = formatUtils.readFile(contents);
  db.put(json);
}

export default function setup() {
  ProduceCompletions.Subscribe((text) => {
    if ("new ".indexOf(text) != -1) {
      return "new {Optional Tag Name}";
    }
  });

  InputRecieved.Subscribe((text) => {
    let regex = /^(new) ?((.)+)?$/;
    let result = text.match(regex);
    if (result) {
      console.log("Running new");
      let tag = result[2];
      if (tag) {
        newEntry(tag.trim());
      } else {
        newEntry();
      }
    }
  });
}
