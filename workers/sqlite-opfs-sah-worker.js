import * as Comlink from "comlink";
import SqliteOPFSSAHBenchmark from "../benchmarks/sqlite-opfs-sah";

(async function () {
  postMessage(null);
  Comlink.expose(SqliteOPFSSAHBenchmark);
})();
