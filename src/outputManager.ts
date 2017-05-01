import * as yaml from "js-yaml";
import * as path from "path";
import {archive} from "./commands/db-archive";
import asyncUtils from "./async-utils";
import settingsManager from "./settingsManager";
import docUtils from "./docUtils";
import pouchManager from "./pouchManager";
import editorManager from "./editorManager";

export module OutputManager {
    export async function writeResults(docs: any, edit: boolean) {
        let settings = await settingsManager.getSettings();
        let docsPath = path.join(".", "docs." + settings.extension);
        await asyncUtils.writeFile(docsPath, yaml.dump(docs));
        let promise = editorManager.editFile(docsPath, edit);
        if (edit) {
            await promise;
            await archive();
        }
    }

    export function printResults(docs: any) {
        console.log(yaml.dump(docs));
    }

    export async function outputResults(docs: any[], output: boolean, all: boolean, edit: boolean) {
        try {
            let db = await pouchManager.getLocalDb();
            let previousDoc: any = { _id: "previous" };

            try {
                previousDoc = await db.get("previous");
            } catch (err) { }

            previousDoc.results = docs;
            await db.put(previousDoc);

            let result: any = {};
            let textFiles:{name: string, content: string}[] = []
            for (let doc of docs) {
                let prettifiedDoc = docUtils.PrettifyDoc(doc, all);
                result = {...prettifiedDoc, ...result};
            }

            if (output || edit) {
                await writeResults(result, edit);
            }

            printResults(result);
        } catch (err) {
            console.error(err);
        }
    }
}

export default OutputManager;
