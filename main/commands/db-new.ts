import * as moment from "moment";
import * as editorManager from "../editorManager";
import asyncUtils from "../async-utils";
import pouchManager from "../pouchManager";
import formatUtils from "../formatUtils";
import {InputRecieved, ProduceCompletions} from "../inputBox";

export async function newEntry(tag?: string) {
  let db = await pouchManager.getDb();
  let now = moment.utc().valueOf();
  let entryName = now.toString();
  let entry: any = { };
  if (tag) entry[tag] = "";
  entry["_id"] = entryName;
  console.log(entry);

  await editorManager.editTempFile(entry);
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
