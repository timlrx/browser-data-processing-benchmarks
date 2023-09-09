[![Netlify Status](https://api.netlify.com/api/v1/badges/120f54e3-0785-4c28-a3c8-7b1c24ae8572/deploy-status)](https://app.netlify.com/sites/browser-data-benchmarks/deploys)

# Browser Data Processing Library Benchmarks

Recent developments in web assembly, browser APIs and data formats (Arrow & Parquet) have made it possible to efficiently run moderately complex data manipulation operations on the client side. This in-browser benchmark compares the performance of different data processing libraries including, [Arquero], [SQLite WASM] and [DuckDB WASM] across a variety of transactional and analytical queries.

Each test fetches the 1,000,000 Bandcamp sales dataset before running the tests on a separate browser thread. Try running the [benchmarks] directly in your browser!

## Data

[1,000,000 Bandcamp sales] with 24 columns. Approximate size - 301mb uncompressed, 74mb parquet zstd (used in Arquero and DuckDB), 100mb Gzip DB (used in SQLite).

## Library Comparisons

- Arquero with parquet wasm
- SQLite WASM, in memory
- SQLite WASM, in memory, with indexes
- SQLite, [OPFS]
- DuckDB WASM, in memory
- DuckDB, [HTTPFS]

## Results

_Note_: Data fetching and loading timings are included in the benchmark but should be taken with a grain of salt as they are dependent on the network and the browser's cache.

### 11th Gen Intel(R) Core(TM) i7-1165G7 @2.80GHz Windows Laptop and Chrome 116:

| Test | arquero | danfo | sqlite | sqlite (indexed) | sqlite (OPFS) | sqlite (OPFS + SAH) | duckdb | duckdb (HttpFS) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fetch data | 3.009 | 16.86 | 2.661 | 2.483 | 2.438 | 4.951 | 1.508 | n/a |
| Load data | 2.866 | n/a | 0.893 | 3.907 | 0.832 | 2.089 | 4.309 | 0.463 |
| Test 1: SELECT top level metrics - overall count, mean and total sales | 0.067 | 0.193 | 0.376 | 0.103 | 2.402 | 0.72 | 0.014 | 0.859 |
| Test 2: SELECT group by day and count daily sales and total revenue | 1.05 | 4.068 | 0.638 | 0.005 | 2.603 | 1.181 | 0.163 | 1.648 |
| Test 3: SELECT for each item type, slug type combination the top 5 countries by overall counts | 4.847 | 3.413 | 1.432 | 0.165 | 3.311 | 1.938 | 0.114 | 1.477 |
| Test 4: SELECT 10 random rows | 0.517 | 1.665 | 0.991 | 0.002 | 12.033 | 2.412 | 0.032 | 7.325 |
| Test 5: CREATE an index | n/a | n/a | 0.573 | n/a | 2.51 | 0.86 | 0.24 | n/a |
| Test 6: SELECT 1000 random rows with an index | n/a | n/a | 0.054 | 0.065 | 3.795 | 0.1 | 1.048 | n/a |
| Test 7: UPDATE 2 fields in 1000 rows with an index | n/a | n/a | 0.038 | 0.062 | 42.316 | 16.411 | 0.588 | n/a |
| Test 8: INSERT 1000 rows with an index | n/a | n/a | 0.041 | 0.078 | 51.042 | 15.851 | 1.397 | n/a |
| Test 9: DELETE 1000 rows with an index | n/a | n/a | 0.035 | 0.064 | 48.147 | 15.546 | 2.376 | n/a |

### Apple M2 Macbook Air and Chrome 116:

| Test                                                                                           | arquero | sqlite | sqlite (indexed) | sqlite (OPFS) | duckdb | duckdb (HttpFS) |
| ---------------------------------------------------------------------------------------------- | ------- | ------ | ---------------- | ------------- | ------ | --------------- |
| Fetch data                                                                                     | 1.308   | 1.426  | 1.543            | 1.238         | 1.031  | n/a             |
| Load data                                                                                      | 1.554   | 1.305  | 2.978            | 0.123         | 3.65   | 0.217           |
| Test 1: SELECT top level metrics - overall count, mean and total sales                         | 0.042   | 0.321  | 0.081            | 1.016         | 0.008  | 0.554           |
| Test 2: SELECT group by day and count daily sales and total revenue                            | 0.484   | 0.501  | 0.001            | 1.311         | 0.086  | 0.998           |
| Test 3: SELECT for each item type, slug type combination the top 5 countries by overall counts | 2.173   | 1.112  | 0.116            | 1.866         | 0.075  | 0.959           |
| Test 4: SELECT 10 random rows                                                                  | 0.291   | 0.858  | 0.001            | 5.52          | 0.013  | 3.024           |
| Test 5: CREATE an index                                                                        | n/a     | 0.471  | n/a              | 1.147         | 0.126  | n/a             |
| Test 6: SELECT 1000 random rows with an index                                                  | n/a     | 0.027  | 0.028            | 0.549         | 0.483  | n/a             |
| Test 7: UPDATE 2 fields in 1000 rows with an index                                             | n/a     | 0.023  | 0.038            | 6.865         | 0.154  | n/a             |
| Test 8: INSERT 1000 rows with an index                                                         | n/a     | 0.029  | 0.048            | 7.55          | 0.31   | n/a             |
| Test 9: DELETE 1000 rows with an index                                                         | n/a     | 0.021  | 0.041            | 7.728         | 0.294  | n/a             |

## Development

You have `sqlite3` and `duckdb` installed and available on the system's path.

1. Clone the repository and `yarn install`
2. `scripts/download.sh` to retrieve bandcamp csv data
3. `scripts/create-parquet.sh` to create a compressed zstd parquet file
4. `scripts/create-db.sh` to create a sqlite db file
5. `yarn dev` to start the dev server (fetches local data)
6. `node scripts/upload-to-r2.js` to upload the files to Cloudflare R2 storage. Please set `.env` variables for `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `ENDPOINT`.
7. `yarn build` to build the site and `yarn preview` to preview the prod build.

## Prior Art

- [wa-sqlite](https://rhashimoto.github.io/wa-sqlite/demo/benchmarks.html) - SQLite variants focused and mostly transactional queries. Thanks for the template and inspiration!
- [DuckDB versus](https://shell.duckdb.org/versus) - DuckDB-Wasm vs sql.js vs Arquero vs Lovefield on the TPC-H benchmark (analytical queries). More statistically robust, runs on node.js and not directly on the browser.

[Arquero]: https://github.com/uwdata/arquero
[SQLite WASM]: https://sqlite.org/wasm/doc/trunk/index.md
[DuckDB WASM]: https://github.com/duckdb/duckdb-wasm
[benchmarks]: https://browser-data-benchmarks.netlify.app/
[1,000,000 Bandcamp sales]: https://components.one/datasets/bandcamp-sales
[OPFS]: https://web.dev/origin-private-file-system/
[HTTPFS]: https://duckdb.org/docs/extensions/httpfs.html
