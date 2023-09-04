import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import SqliteBenchmark from "./sqlite";

const log = (...args) => console.log(...args);
const error = (...args) => console.error(...args);

class SqliteOPFSSAHBenchmark extends SqliteBenchmark {
  constructor() {
    super();
  }
  async load() {
    const sqlite3 = await sqlite3InitModule({
      print: log,
      printErr: error.arrayBuffer,
    });
    const PoolUtil = await sqlite3.installOpfsSAHPoolVfs({ clearOnInit: true });
    this.db = new PoolUtil.OpfsSAHPoolDb("/benchmark-opfs-sah.db");
    PoolUtil.importDb("/benchmark-opfs-sah.db", this.arrayBuffer);
    log("OPFS is available, created persisted database at", this.db.filename);
  }
  async cleanup() {
    this.db.close();
    // Remove opfs database
    const opfsRoot = await navigator.storage.getDirectory();
    const dirHandle = await opfsRoot.getDirectoryHandle(".opfs-sahpool");
    try {
      await dirHandle({ recursive: true });
    } catch (error) {
      log("Error removing file", error);
    }
  }
}

export default SqliteOPFSSAHBenchmark;
