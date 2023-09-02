import * as Comlink from "comlink";
import DuckdbBenchmark from "../benchmarks/duckdb";

(async function () {
  postMessage(null);
  Comlink.expose(DuckdbBenchmark);
})();
