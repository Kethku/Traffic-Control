import * as pouchdb from "pouchdb";
import * as yaml from "js-yaml";
import pouchManager from "../pouchManager";
import settingsManager from "../settingsManager";
import outputManager from "../outputManager";
import indexManager from "../indexManager";

export async function query(query: string, options: any) {
    let db = await pouchManager.getLocalDb();
    try {
        let queryObj: any;
        try {
            queryObj = yaml.load(query);
        } catch (err) {
            queryObj = JSON.parse(query);
        }
        if (typeof queryObj === "string") {
            await search(query, options);
        } else {
            console.log("Querying...");
            let results = await db.find({ selector: queryObj });
            await outputManager.outputResults(results.docs, options.output, options.all, options.edit);
        }
    } catch (err) {
        console.log(err);
        await search(query, options);
    }
}

export async function search(query: string, options: any) {
    try {
        console.log("Searching...");
        let settings = await settingsManager.getSettings();
        let db = await pouchManager.getLocalDb();
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
        await outputManager.outputResults(docs, options.output, options.all, options.edit);
    } catch (err) {
        console.error(err);
    }
}