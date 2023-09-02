import * as Comlink from "comlink";
import ArqueroBenchmark from "../benchmarks/arquero";

(async function () {
  postMessage(null);
  Comlink.expose(ArqueroBenchmark);
})();
