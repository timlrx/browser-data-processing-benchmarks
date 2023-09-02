import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import SqliteBenchmark from "./sqlite";

const log = (...args) => console.log(...args);
const error = (...args) => console.error(...args);

class SqliteIndexedBenchmark extends SqliteBenchmark {
  constructor() {
    super();
  }
  async load() {
    const sqlite3 = await sqlite3InitModule({
      print: log,
      printErr: error,
    });

    const p = sqlite3.wasm.allocFromTypedArray(this.arrayBuffer);
    this.db = new sqlite3.oo1.DB();
    const rc = sqlite3.capi.sqlite3_deserialize(
      this.db.pointer,
      "main",
      p,
      this.arrayBuffer.byteLength,
      this.arrayBuffer.byteLength,
      // sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
      // Optionally:
      sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE
    );
    this.db.checkRc(rc);
    // Index all columns / expressions that we would use
    this.db.exec("CREATE INDEX idx_column00 ON bandcamp (column00);");
    this.db.exec(
      "CREATE INDEX idx_amount_paid_usd ON bandcamp (amount_paid_usd);"
    );
    this.db.exec(
      "CREATE INDEX idx_utc_date ON bandcamp(DATE(utc_date, 'unixepoch'));"
    );
    this.db.exec(
      "CREATE INDEX idx_cty_item_slug_type ON bandcamp (country, item_type, slug_type);"
    );
  }
  async createIndex() {
    return "n/a";
  }
}

export default SqliteIndexedBenchmark;
