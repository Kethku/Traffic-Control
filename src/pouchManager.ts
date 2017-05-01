import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as pouchdb from "pouchdb";
import * as pouchdbFind from "pouchdb-find";
import * as pouchdbQuickSearch from "pouchdb-quick-search";
import settingsManager from "./settingsManager";
import asyncUtils from "./async-utils";
import indexManager from "./indexManager";

export module PouchManager {

    let db: PouchDB.Database<any>;

    export async function clear() {
        try {
            let dbDirectory = path.join(os.homedir(), ".db");
            await asyncUtils.deleteFile(dbDirectory);
        } catch (err) {
            console.error(err);
        }
    }

    export async function sync() {
        try {
            await getLocalDb();
            let settings = await settingsManager.getSettings();
            if (settings.remoteUrl) {
                let remoteDb = new pouchdb(settings.remoteUrl);
                console.log("Syncing...");
                await db.sync(remoteDb);
                console.log("Sync complete.");
            } else {
                console.error("No remote url to sync to.");
            }
        } catch (err) {
            console.error(err);
        }
    }

    export async function getLocalDb() {
        try {
            if (db === undefined) {
                let settings = await settingsManager.getSettings();
                pouchdb.plugin(pouchdbFind);
                pouchdb.plugin(pouchdbQuickSearch);
                let dbDirectory = path.join(os.homedir(), ".db");
                if (!await asyncUtils.exists(dbDirectory)) {
                    await asyncUtils.makedir(dbDirectory);
                }
                db = new pouchdb(path.join(dbDirectory, "db"));
            }
            let indexes = await indexManager.getIndexedFields(db);
            await db.createIndex({index: {fields: indexes}});
            await db.search({fields: indexes, build: true});
            return db;
        } catch (err) {
            console.error(err);
        }
    }
}

export default PouchManager;
