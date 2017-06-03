import * as os from "os";
import * as path from "path";
import * as pouchdb from "pouchdb";
import * as pouchdbQuickSearch from "pouchdb-quick-search";
import * as pouchdbFind from "pouchdb-find";
import asyncUtils from "./async-utils";
import indexManager from "./indexManager";
import * as settingsManager from "./settingsManager";

export module PouchManager {
  let remoteDb: PouchDB.Database<any>;
  let db: PouchDB.Database<any>;

  function syncDb() {
    return new Promise((resolve, reject) => {
      remoteDb.sync(db, {
        live: true,
        retry: true
      }).on("complete", (info) => {
        console.log("sync complete");
        resolve();
      }).on("error", (error) => {
        reject(error);
      }).on("denied", (error) => {
        reject(error);
      }).on("paused", (error) => {
        console.error("paused: " + error);
      }).on("active", () => {
        console.log("resumed");
      });
    });
  }

  export async function getDb() {
    try {
      if (db === undefined) {
        let settings = await settingsManager.readSettings();
        pouchdb.plugin(pouchdbQuickSearch);
        pouchdb.plugin(pouchdbFind);
        remoteDb = new pouchdb("http://" + settings.user + ":" + settings.pass + "@localhost:5984/personal");
        console.log(remoteDb);
        console.log(await remoteDb.info());
        let dbDirectory = path.join(os.homedir(), ".db");
        if (!await asyncUtils.exists(dbDirectory)) {
          await asyncUtils.makedir(dbDirectory);
        }
        let localDbAddress = path.join(dbDirectory, "db");
        db = new pouchdb(localDbAddress);
        console.log(db);
        console.log(await db.info());
        await syncDb();
      }
      let indexes = await indexManager.getIndexedFields(db);
      await db.createIndex({index: {fields: indexes}});
      await db.search({fields: indexes, build: true});
      return db;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

export default PouchManager;
