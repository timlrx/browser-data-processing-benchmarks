import * as Comlink from "comlink";
import SqliteOPFSBenchmark from "../benchmarks/sqlite-opfs";

(async function () {
  postMessage(null);
  Comlink.expose(SqliteOPFSBenchmark);
})();
