import * as os from "os";
import * as path from "path";
import PouchDB from "pouchdb";
import * as PouchQuickSearch from "pouchdb-quick-search";
import * as PouchFind from "pouchdb-find";
import asyncUtils from "./async-utils";
import indexManager from "./indexManager";
import * as settingsManager from "./settingsManager";

var pouchdb = PouchDB
  .plugin(require('pouchdb-quick-search'))
  .plugin(require('pouchdb-find').default)
  .plugin(require('pouchdb-adapter-memory').default);

export module PouchManager {
  let remoteDb: PouchDB.Database<any>;
  let db: PouchDB.Database<any>;

  function syncDb() {
    return new Promise((resolve, reject) => {
      let resolved = false;
      remoteDb.sync(db, {
        live: true,
        retry: true
      }).on("error", (error) => {
        reject(error);
      }).on("denied", (error) => {
        reject(error);
      }).on("paused", (error) => {
        if (error) {
          console.error("paused: " + error);
        } else if (!resolved) {
          console.log("Sync up to date!");
          resolve();
          resolved = true;
        }
      }).on("active", () => {
        console.log("resumed");
      });
    });
  }

  export async function getDb() {
    try {
      if (db === undefined) {
        let settings = await settingsManager.readSettings();
        remoteDb = new pouchdb("http://" + settings.user + ":" + settings.pass + "@localhost:5984/personal");
        let dbDirectory = path.join(os.homedir(), ".db");
        if (!await asyncUtils.exists(dbDirectory)) {
          await asyncUtils.makedir(dbDirectory);
        }
        let localDbAddress = path.join(dbDirectory, "db");
        db = new pouchdb("db", {adapter: "memory"});
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
