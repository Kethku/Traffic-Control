import * as yaml from "js-yaml";

import pouchManager from "../pouchManager";
import docUtils from "../docUtils"
import utils from "../utils";

export async function update(patch: string, index: number,  options: any) {
    if (!index) {
        index = 0;
    }

    if (!patch) {
        if (!options["delete"]) {
            console.log("Requires a patch if not deleting");
        }
    }

    try {
        let db = await pouchManager.getLocalDb();
        let previous = await db.get("previous");
        let previousDocs = previous.results;

        let effectedDocuments: any[];
        if (options.all) {
            effectedDocuments = previousDocs;
        } else {
            if (index < 0 || index > previousDocs.length - 1) {
                console.error("Index out of bounds")
            } else {
                effectedDocuments = [previousDocs[index]];
            }
        }

        let updatedDocs: any[] = [];
        for (let doc of effectedDocuments) {
            try {
                updatedDocs.push(await db.get(doc["_id"]));
            } catch (err) { }
        }
        effectedDocuments = updatedDocs;

        if (effectedDocuments.length == 0) {
            console.log("No documents to update");
        }

        if (options["delete"]) {
            for (let doc of effectedDocuments) {
                doc["_deleted"] = true;
                await db.put(doc);
                console.log(yaml.dump(doc));
            }
            console.log("Deleted");
        } else {
            let patchedDocs: any = [];
            for (let doc of effectedDocuments) {
                let patchObj: any;
                try {
                    patchObj = JSON.parse(patch);
                } catch (err) {
                    try {
                        patchObj = yaml.load(patch);
                    } catch (err) {
                        console.error("Patch poorly formated");
                        return;
                    }
                }

                let patchedDoc = {...doc, ...patchObj};
                for (let id in patchedDoc) {
                    if (patchedDoc[id] === null) {
                        delete patchedDoc[id];
                    }
                }
                let response = await db.put(patchedDoc);
                patchedDocs.push(patchedDoc);
            }
            effectedDocuments = patchedDocs;
            console.log(yaml.dump(patchedDocs));
        }

        previous.results = effectedDocuments;
        db.put(previous);
    } catch (err) {
        console.error(err);
    }
}
