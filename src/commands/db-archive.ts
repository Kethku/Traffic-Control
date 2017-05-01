import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as moment from "moment";
import asyncUtils from "./async-utils";
import pouchManager from "./pouchManager";
import outputManager from "./outputManager";
import settingsManager from "./settingsManager";
import indexManager from "./indexManager";
import docUtils from "./docUtils";

export async function archive(path?: string) {
    let settings = await settingsManager.getSettings();
    if (!path) {
        path = ".";
    }
    if (fs.lstatSync(path).isDirectory()) {
        let dirPath = path;
        let yamlFiles = (await asyncUtils.readdir(dirPath)).filter((name) => name.split('.').pop().toLowerCase() === settings.extension);
        let promises = [];
        for (let file of yamlFiles) {
            promises.push(archiveFile(file));
        }
        return Promise.all(promises);
    } else {
        return archiveFile(path);
    }
}

export async function archiveFile(file: string) {
    console.log("Archiving " + file + "...");
    let db = await pouchManager.getLocalDb();
    file = path.basename(file);
    let newDocs = yaml.load((await asyncUtils.readFile(file)).toString());
    for (let name in newDocs) {
        let doc = await docUtils.UglifyDoc(name, newDocs[name]);
        await db.put(doc);
    }
    await asyncUtils.deleteFile(file);
}
