import * as Comlink from "comlink";
import DanfoBenchmark from "../benchmarks/danfo";

(async function () {
  postMessage(null);
  Comlink.expose(DanfoBenchmark);
})();
