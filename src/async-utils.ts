import * as fs from "fs";

export module AsyncUtils {
  export function readFile(path: string, options?: string | {encoding?: string, flag?: string}) {
    return new Promise<string | Buffer>((resolve, reject) => {
      fs.readFile(path, options, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  export function readdir(path: string) {
    return new Promise<string[]>((resolve, reject) => {
      fs.readdir(path, (err, items) => {
        if (err) reject(err);
        else resolve(items);
      });
    });
  }

  export function writeFile(path: string, data: string | Buffer) {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(path, data, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  export function deleteFile(path: string) {
    return new Promise<void>((resolve, reject) => {
      fs.unlink(path, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  export function exists(path: string) {
    return new Promise<boolean>((resolve, reject) => {
      fs.exists(path, (exists) => {
        resolve(exists);
      });
    });
  }

  export function makedir(path: string | Buffer) {
    return new Promise<void>((resolve, reject) => {
      fs.mkdir(path, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  export function watch(path: string) {
    return new Promise<void>((resolve, reject) => {
      let watcher: fs.FSWatcher;
      watcher = fs.watch(path, (event) => {
        if (event === "change") {
          watcher.close();
          resolve();
        }
      });
    });
  }
}

export default AsyncUtils;
