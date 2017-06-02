import * as os from "os";
import * as path from "path";
import * as fs from "fs";
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
    console.log("syncing");
    return new Promise((resolve, reject) => {
      db.sync(remoteDb, {
        retry: true
      }).on("complete", (info) => {
        console.log("sync complete: " + info);
        resolve();
      }).on("error", (error) => {
        reject(error);
      }).on("denied", (error) => {
        reject(error);
      }).on("paused", (error) => {
        console.log("paused: " + error);
      }).on("active", () => {
        console.log("resumed");
      });
    });
  }

  export async function getDb() {
    try {
      if (db === undefined) {
        let settings = await settingsManager.readSettings();
        console.log(settings);
        pouchdb.plugin(pouchdbQuickSearch);
        pouchdb.plugin(pouchdbFind);
        remoteDb = new pouchdb("http://localhost:5984/personal");
        db = new pouchdb("personal");
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
