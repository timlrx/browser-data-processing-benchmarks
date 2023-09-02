#!/bin/sh

./duckdb <<EOF
COPY (SELECT * FROM read_csv_auto('./public/data/1000000-bandcamp-sales.csv')) 
TO './public/data/1000000-bandcamp-sales-zstd2.parquet' (FORMAT 'PARQUET', CODEC 'ZSTD');
EOF
