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

| Test                                                                                           | arquero | sqlite | sqlite (indexed) | sqlite (OPFS) | duckdb | duckdb (HttpFS) |
| ---------------------------------------------------------------------------------------------- | ------- | ------ | ---------------- | ------------- | ------ | --------------- |
| Fetch data                                                                                     | 1.843   | 2.571  | 2.161            | 2.118         | 0.137  | n/a             |
| Load data                                                                                      | 2.267   | 1.309  | 3.628            | 2.435         | 3.783  | 0.205           |
| Test 1: SELECT top level metrics - overall count, mean and total sales                         | 0.058   | 0.333  | 0.107            | 2.152         | 0.015  | 0.607           |
| Test 2: SELECT group by day and count daily sales and total revenue                            | 0.866   | 0.597  | 0.002            | 2.335         | 0.124  | 1.039           |
| Test 3: SELECT for each item type, slug type combination the top 5 countries by overall counts | 3.857   | 1.278  | 0.139            | 2.982         | 0.097  | 0.951           |
| Test 4: SELECT 10 random rows                                                                  | 0.435   | 0.861  | 0.001            | 10.759        | 0.028  | 3.95            |
| Test 5: CREATE an index                                                                        | n/a     | 0.522  | n/a              | 2.269         | 0.22   | n/a             |
| Test 6: SELECT 1000 random rows with an index                                                  | n/a     | 0.043  | 0.049            | 2.156         | 0.942  | n/a             |
| Test 7: UPDATE 2 fields in 1000 rows with an index                                             | n/a     | 0.037  | 0.052            | 23.006        | 0.401  | n/a             |
| Test 8: INSERT 1000 rows with an index                                                         | n/a     | 0.041  | 0.064            | 29.481        | 0.672  | n/a             |
| Test 9: DELETE 1000 rows with an index                                                         | n/a     | 0.029  | 0.049            | 27.723        | 0.693  | n/a             |

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
