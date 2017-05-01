import pouchManager from "./pouchManager";
import indexManager from "./indexManager";

export module DocUtilities {
    export function PrettifyDoc(doc: any, all: boolean) {
        let id = doc["_id"];
        for (let id in doc) {
            if (id.startsWith("_") || (id.startsWith("$") && !all)) {
                delete doc[id];
            }
        }

        let result: any = {};
        result[id] = doc;
        return result;
    }

    export async function UglifyDoc(name: string, doc: any) {
        await indexManager.updateIndexedFields(doc);
        let current: any = {};
        try {
            current = await (await pouchManager.getLocalDb()).get(name);
        } catch (err) {
            if (err.status === 404) {
                current["_id"] = name;
            } else {
                throw err;
            }
        }

        let combined = doc;
        for (let key in current) {
            if (key.startsWith("_") || key.startsWith("$")) {
                combined[key] = current[key];
            }
        }
        return doc;
    }
}

export default DocUtilities;
