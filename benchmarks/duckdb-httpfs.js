import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import DuckdbBenchmark from "./duckdb";
import { parquetZstdPath } from "../constants";

const MANUAL_BUNDLES = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

const log = (result) => {
  result.toArray().map((row) => console.log(row.toJSON()));
};

class DuckdbHttpFsBenchmark extends DuckdbBenchmark {
  constructor() {
    super();
  }
  async fetch() {
    return "n/a";
  }
  async load() {
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    const worker = new Worker(bundle.mainWorker);
    const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.ERROR);
    this.db = new duckdb.AsyncDuckDB(logger, worker);
    await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    this.c = await this.db.connect();
    // HTTPFS
    const url = new URL(parquetZstdPath, import.meta.url).href;
    await this.c.query(`CREATE VIEW bandcamp AS SELECT * FROM "${url}"`);
  }
  async createIndex() {
    return "n/a";
  }
  async selectRowsWithIndex() {
    return "n/a";
  }
  async updateRows() {
    return "n/a";
  }
  async insertRows() {
    return "n/a";
  }
  async deleteRows() {
    return "n/a";
  }
  async cleanup() {
    await this.c.close();
  }
}

export default DuckdbHttpFsBenchmark;
