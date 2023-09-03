import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import BaseBenchmark from "./base";
import { parquetZstdPath } from "../constants";
import randomNumbers from "../numbers.json";

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

class DuckdbBenchmark extends BaseBenchmark {
  constructor() {
    super();
    this.arrayBuffer = null;
    this.db = null;
    this.c = null;
  }
  async fetch() {
    const response = await fetch(parquetZstdPath);
    if (!response.ok) {
      throw new Error(`HTTP error, status = ${response.status}`);
    }
    this.arrayBuffer = await response.arrayBuffer();
  }
  async load() {
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    const worker = new Worker(bundle.mainWorker);
    const logger = new duckdb.ConsoleLogger();
    this.db = new duckdb.AsyncDuckDB(logger, worker);
    await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    this.c = await this.db.connect();
    await this.db.registerFileBuffer(
      "buffer.parquet",
      new Uint8Array(this.arrayBuffer)
    );
    await this.c.query(
      `CREATE TABLE bandcamp AS SELECT * FROM parquet_scan('buffer.parquet')`
    );
  }
  async topLevelMetrics() {
    await this.c.query(`
      SELECT
        count(*) AS count,
        SUM(amount_paid_usd) AS total_sales,
        AVG(amount_paid_usd) AS mean_sales
      FROM bandcamp
    `);
  }
  async salesPerDay() {
    await this.c.query(`
      SELECT 
        strftime(to_timestamp((utc_date)::BIGINT), '%Y-%m-%d') AS date, 
        count(*) AS count,
        SUM(amount_paid_usd) AS total_sales
      FROM bandcamp
      GROUP BY date
    `);
  }
  async topCountriesByItemType() {
    await this.c.query(`
      SELECT *
      FROM (
        SELECT
          country,
          item_type,
          slug_type,
          rank() OVER (PARTITION BY item_type, slug_type ORDER BY count(*) DESC) AS rank,
          count(*) AS count
        FROM bandcamp
        GROUP BY country, item_type, slug_type
      ) AS t
      WHERE rank <= 5
      ORDER BY item_type, slug_type, count DESC
    `);
  }
  async selectRows() {
    for (let i = 0; i < 10; i++) {
      await this.c.query(`
          SELECT *
          FROM bandcamp
          WHERE column00 = ${randomNumbers[i]}
        `);
    }
  }
  async createIndex() {
    await this.c.query("CREATE INDEX idx_column00 ON bandcamp (column00);");
  }
  async selectRowsWithIndex() {
    for (let i = 0; i < 1000; i++) {
      await this.c.query(`
        SELECT *
        FROM bandcamp
        WHERE column00 = ${randomNumbers[i]}
      `);
    }
  }
  async updateRows() {
    for (let i = 0; i < 1000; i++) {
      await this.c.query(`
        UPDATE bandcamp
        SET slug_type = 'merch', item_type = 'merch'
        WHERE column00 = ${randomNumbers[i]}
      `);
    }
  }
  async insertRows() {
    for (let i = 0; i < 1000; i++) {
      await this.c.query(`
        INSERT INTO bandcamp 
        VALUES (${-i}, '1599688803.5175&//girlbanddublin.bandcamp.com/album/live-at-vicar-street', 'https://f4.bcbits.com/img/a0206405257_7.jpg', 'a', 1599688803.5175, 'gb', NULL, 'United Kingdom', 'a', '$9.99', 9.98999977111816, 'Live at Vicar Street', 206405257, '//girlbanddublin.bandcamp.com/album/live-at-vicar-street', 9.99, NULL, 'Girl Band', 'USD', NULL, 9.99, NULL, NULL, NULL, NULL);
      `);
    }
  }
  async deleteRows() {
    for (let i = 0; i < 1000; i++) {
      await this.c.query(`
        DELETE FROM bandcamp WHERE column00 = ${randomNumbers[i]}
      `);
    }
  }
  async cleanup() {
    await this.c.close();
  }
}

export default DuckdbBenchmark;
