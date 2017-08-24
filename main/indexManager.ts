import pouchManager from "./pouchManager";

export module IndexManager {
    let defaultIndexes = [ "modified", "todo", "note" ];
    export async function updateIndexedFields(doc: any) {
        let db = await pouchManager.getDb();

        let indexesDocument: any;
        try {
            indexesDocument = await db.get("indexes");

            let newIndexedFields = [];
            for (let field in doc) {
                if (!field.startsWith("_") && !indexesDocument.indexes.some((indexedField: string) => indexedField === field)) {
                    newIndexedFields.push(field);
                }
            }
            if (newIndexedFields.length !== 0) {
                console.log("Indexing: " + JSON.stringify(newIndexedFields) + ", updating settings.")
            }

            indexesDocument.indexes = indexesDocument.indexes.concat(newIndexedFields);
        } catch (err) {
            if (err.status === 404) {
                indexesDocument = {_id: "indexes", indexes: defaultIndexes};
            }
        }
        await db.put(indexesDocument);
    };

    export async function getIndexedFields(db: PouchDB.Database<any>): Promise<string[]> {
        try {
            return (await db.get("indexes") as any).indexes;
        } catch (err) {
            if (err.status === 404) {
                return defaultIndexes;
            }
        }
    }

    export async function indexAll() {
        console.log("Indexing...")
        try {
            let db = await pouchManager.getDb();
            let indexes = await db.get("indexes");
            indexes.indexes = [];
            await db.put(indexes);
            let docs = await db.allDocs({
                include_docs: true,
                startkey: "0",
                endkey: "A"
            });
            for (let row of docs.rows) {
                let doc = row.doc;
                await updateIndexedFields(doc);
            }
        } catch (err) {
            console.error(err);
        }
    }
}

export default IndexManager;
