import pouchManager from "../pouchManager";

export async function recent(countArg?: string, options?: any) {
  let count = 10;
  if (countArg) {
    count = parseInt(countArg)
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
  } catch (err) {
    console.error(err);
  }
}
