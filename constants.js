export const parquetPath = import.meta.env.DEV
  ? "/data/1000000-bandcamp-sales.parquet"
  : "https://bandcamp.zapdos.io/1000000-bandcamp-sales.parquet";

export const parquetZstdPath = import.meta.env.DEV
  ? "/data/1000000-bandcamp-sales-zstd.parquet"
  : "https://bandcamp.zapdos.io/1000000-bandcamp-sales-zstd.parquet";

export const dbPath = import.meta.env.DEV
  ? "/data/1000000-bandcamp-sales.db.gz"
  : "https://bandcamp.zapdos.io/1000000-bandcamp-sales.db.gz";
