import pouchManager from "./pouchManager";
import outputManager from "./outputManager";

export async function recent(countArg?: string, options?: any) {
    let count = 10;
    if (countArg) {
        count = parseInt(countArg)
    }
    try {
        let db = await pouchManager.getLocalDb();
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
        outputManager.outputResults(resultDocs, options.output, options.all, options.edit);
    } catch (err) {
        console.error(err);
    }
}
