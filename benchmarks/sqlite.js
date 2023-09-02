import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import BaseBenchmark from "./base";
import { dbPath } from "../constants";
import randomNumbers from "../numbers.json";

const log = (...args) => console.log(...args);
const error = (...args) => console.error(...args);

// async function decompressBlob(blob) {
//   const ds = new DecompressionStream("gzip");
//   const decompressedStream = blob.stream().pipeThrough(ds);
//   return await new Response(decompressedStream).blob();
// }

class SqliteBenchmark extends BaseBenchmark {
  constructor() {
    super();
    this.arrayBuffer = null;
    this.db = null;
  }
  async fetch() {
    // Specify Content-Encoding as gzip to avoid manually decompressing the response
    // Seems to be the default behaviour for vite on .gz files as well
    const response = await fetch(dbPath);
    if (!response.ok) {
      throw new Error(`HTTP error, status = ${response.status}`);
    }
    this.arrayBuffer = await response.arrayBuffer();
    // const blob = await response.blob();
    // const decompressedBlob = await decompressBlob(blob);
    // this.arrayBuffer = await decompressedBlob.arrayBuffer();
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
  }
  async topLevelMetrics() {
    this.db.exec({
      sql: `
        SELECT
          count(*) AS count,
          SUM(amount_paid_usd) AS total_sales,
          AVG(amount_paid_usd) AS mean_sales
        FROM bandcamp
      `,
    });
  }
  async salesPerDay() {
    this.db.exec({
      sql: `
        SELECT 
          DATE(utc_date, 'unixepoch') AS date, 
          count(*) AS count,
          SUM(amount_paid_usd) AS total_sales
        FROM bandcamp
        GROUP BY date
      `,
    });
  }
  async topCountriesByItemType() {
    this.db.exec({
      sql: `
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
      `,
    });
  }
  async selectRows() {
    for (let i = 0; i < 10; i++) {
      this.db.exec({
        sql: `
          SELECT *
          FROM bandcamp
          WHERE column00 = ${randomNumbers[i]}
        `,
      });
    }
  }
  async createIndex() {
    this.db.exec("CREATE INDEX idx_column00 ON bandcamp (column00);");
  }
  async selectRowsWithIndex() {
    for (let i = 0; i < 1000; i++) {
      this.db.exec({
        sql: `
          SELECT *
          FROM bandcamp
          WHERE column00 = ${randomNumbers[i]}
        `,
      });
    }
  }
  async updateRows() {
    for (let i = 0; i < 1000; i++) {
      this.db.exec({
        sql: `
          UPDATE bandcamp
          SET slug_type = 'merch', item_type = 'merch'
          WHERE column00 = ${randomNumbers[i]}
      `,
      });
    }
  }
  async insertRows() {
    for (let i = 0; i < 1000; i++) {
      this.db.exec({
        sql: `
        INSERT INTO bandcamp 
        VALUES (${-i}, '1599688803.5175&//girlbanddublin.bandcamp.com/album/live-at-vicar-street', 'https://f4.bcbits.com/img/a0206405257_7.jpg', 'a', 1599688803.5175, 'gb', NULL, 'United Kingdom', 'a', '$9.99', 9.98999977111816, 'Live at Vicar Street', 206405257, '//girlbanddublin.bandcamp.com/album/live-at-vicar-street', 9.99, NULL, 'Girl Band', 'USD', NULL, 9.99, NULL, NULL, NULL, NULL);
      `,
      });
    }
  }
  async deleteRows() {
    for (let i = 0; i < 1000; i++) {
      this.db.exec({
        sql: `
          DELETE FROM bandcamp WHERE column00 = ${randomNumbers[i]}
        `,
      });
    }
  }
  async cleanup() {
    this.db.close();
  }
  async result() {
    return "sqlite";
  }
  async compute() {
    return 3 + 5;
  }
}

export default SqliteBenchmark;
