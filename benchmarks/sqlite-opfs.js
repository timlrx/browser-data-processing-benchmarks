import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import SqliteBenchmark from "./sqlite";

const log = (...args) => console.log(...args);
const error = (...args) => console.error(...args);

class SqliteOPFSBenchmark extends SqliteBenchmark {
  constructor() {
    super();
  }
  async load() {
    const sqlite3 = await sqlite3InitModule({
      print: log,
      printErr: error.arrayBuffer,
    });
    // Overwrites existing content
    await sqlite3.oo1.OpfsDb.importDb("benchmark-opfs.db", this.arrayBuffer);
    this.db = new sqlite3.oo1.OpfsDb("benchmark-opfs.db", "c");
    // const PoolUtil = await sqlite3.installOpfsSAHPoolVfs();
    // PoolUtil.importDb("benchmark-opfs-sah.db", this.arrayBuffer);
    // this.db = new PoolUtil.OpfsSAHPoolDb("benchmark-opfs-sah.db");
    // await poolUtil.importDb("benchmark-opfs-sah.db", this.arrayBuffer);
    // this.db = new PoolUtil.OpfsSAHPoolDb("benchmark-opfs-sah.db");
    // this.db.exec({
    //   sql: `CREATE TABLE hello (id INTEGER PRIMARY KEY)`,
    //   callback: (r) => console.log(r),
    // });

    log("OPFS is available, created persisted database at", this.db.filename);
  }
  async cleanup() {
    this.db.close();
    // Remove opfs database
    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle("benchmark-opfs.db");
    try {
      await fileHandle.remove();
    } catch (error) {
      log("Error removing file", error);
    }
  }
}

export default SqliteOPFSBenchmark;
