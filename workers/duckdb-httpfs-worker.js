import * as Comlink from "comlink";
import DuckdbHttpFsBenchmark from "../benchmarks/duckdb-httpfs";

(async function () {
  postMessage(null);
  Comlink.expose(DuckdbHttpFsBenchmark);
})();
