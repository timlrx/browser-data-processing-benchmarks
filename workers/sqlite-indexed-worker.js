import * as Comlink from "comlink";
import SqliteIndexedBenchmark from "../benchmarks/sqlite-indexed";

(async function () {
  postMessage(null);
  Comlink.expose(SqliteIndexedBenchmark);
})();
