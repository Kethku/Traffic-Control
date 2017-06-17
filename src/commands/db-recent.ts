import pouchManager from "../pouchManager";
import {InputRecieved, ProduceCompletions} from "../inputBox";

export async function recent(countArg?: number) {
  let count = 10;
  if (countArg) {
    count = countArg;
  }
  try {
    let db = await pouchManager.getDb();
    console.log("Fetching " + count + " most recent...");
    let results = await db.find({
      selector: {
        "$and": [
          { "_id": {"$exists": true} },
          { "_id": {"$lt": "A"} }
        ]
      },
      sort: [{"_id": "desc"}],
      limit: count
    });
    let resultDocs = [];
    for (let i = 0; i < Math.min(results.docs.length, count); i++) {
      resultDocs.push(results.docs[i]);
    }
    // Display docs.
  } catch (err) {
    console.error(err);
  }
}

export default function setup() {
  ProduceCompletions.Subscribe((text) => {
    if ("recent ".indexOf(text) != -1) {
      return "r {Optional Count}";
    }
  });

  InputRecieved.Subscribe((text) => {
    let regex = /^(recent|r) ?((.)+)?$/;
    let result = text.match(regex);
    let count = result[2];
    if (count) {
      recent(parseInt(count.trim()));
    } else {
      recent();
    }
  });
}
