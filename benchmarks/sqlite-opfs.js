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
