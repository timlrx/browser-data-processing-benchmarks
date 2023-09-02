import * as Comlink from "comlink";
import SqliteBenchmark from "../benchmarks/sqlite";

(async function () {
  postMessage(null);
  Comlink.expose(SqliteBenchmark);
})();
