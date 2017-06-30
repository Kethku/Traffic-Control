import * as pouchdb from "pouchdb";
import * as yaml from "js-yaml";
import pouchManager from "../pouchManager";
import indexManager from "../indexManager";
import {InputRecieved, ProduceCompletions} from "../inputBox";
import * as entryRenderer from "../entryRenderer";

export async function query(query: string) {
  let db = await pouchManager.getDb();
  try {
    let queryObj: any;
    try {
      queryObj = yaml.load(query);
    } catch (err) {
      queryObj = JSON.parse(query);
    }
    if (typeof queryObj === "string") {
      await search(query);
    } else {
      console.log("Querying...");
      let results = await db.find({ selector: queryObj });
      entryRenderer.renderEntries(results.docs);
    }
  } catch (err) {
    console.log(err);
    await search(query);
  }
}

export async function search(query: string) {
  try {
    console.log("Searching...");
    let db = await pouchManager.getDb();
    let indexedFields = await indexManager.getIndexedFields(db);
    let results = await db.search({query: query, fields: indexedFields, include_docs: true})
    let docs = results.rows.map(row => row.doc);
    let terms = query.split(" ");
    let selector: any = {};
    for (let term of terms) {
      selector[term] = { $exists: true };
    }
    selector["_id"] = { $lt: "A" };
    docs = docs.concat((await db.find({ selector: selector})).docs);
    docs = docs.filter((doc) => doc["_id"] < "A")
    entryRenderer.renderEntries(docs);
  } catch (err) {
    console.error(err);
  }
}

export default function setup() {
  ProduceCompletions.Subscribe((text) => {
    if ("search ".indexOf(text) != -1 || "query ".indexOf(text) != -1) {
      return "s {Query}";
    }
  });

  InputRecieved.Subscribe((text) => {
    let regex = /^(search|s|query|q) ((.)+)$/;
    let result = text.match(regex);
    if (result) {
      let query = result[2];
      if (query) {
        console.log("Running search");
        search(query);
      }
    }
  })
}
