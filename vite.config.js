import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  root: "./",
  plugins: [wasm(), topLevelAwait()],
  worker: {
    plugins: [wasm(), topLevelAwait()],
    format: "es",
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  build: {
    // support for worker modules in firefox was added in v111
    // https://caniuse.com/mdn-api_decompressionstream
    target: ["chrome89", "safari16", "firefox113"],
  },
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
});
