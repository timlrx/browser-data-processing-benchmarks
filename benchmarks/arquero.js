import * as parquetWasm from "parquet-wasm/bundler/arrow2";
import * as aq from "arquero";
import { op } from "arquero";
import BaseBenchmark from "./base";
import { parquetZstdPath } from "../constants";
import randomNumbers from "../numbers.json";

const log = (result) => {
  console.log(result.print());
};

class ArqueroBenchmark extends BaseBenchmark {
  constructor() {
    super();
    this.arrayBuffer = null;
    this.dt = null;
  }
  async fetch() {
    const response = await fetch(parquetZstdPath);
    if (!response.ok) {
      throw new Error(`HTTP error, status = ${response.status}`);
    }
    console.log(response);
    this.arrayBuffer = await response.arrayBuffer();
  }
  async load() {
    const arr = new Uint8Array(this.arrayBuffer);
    await parquetWasm;
    const arrowIPC = parquetWasm.readParquet(arr);
    this.dt = aq.fromArrow(arrowIPC);
  }
  async topLevelMetrics() {
    this.dt.rollup({
      total_sales: op.sum("amount_paid_usd"),
      mean_sales: op.mean("amount_paid_usd"),
      count: op.count(),
    });
  }
  async salesPerDay() {
    //  op.month returns a zero-based month index, so we add 1 to it.
    this.dt
      .derive({
        parse_date: (d) => op.parse_date(d.utc_date * 1000),
      })
      .derive({
        date: (d) =>
          `${op.utcyear(d.parse_date)}-${
            op.utcmonth(d.parse_date) + 1
          }-${op.utcdate(d.parse_date)}`,
      })
      .groupby("date")
      .rollup({ count: op.count(), total_sales: op.sum("amount_paid_usd") })
      .orderby("date")
      .select("date", "count", "total_sales");
  }
  async topCountriesByItemType() {
    this.dt
      .groupby("country", "item_type", "slug_type")
      .count()
      .groupby("item_type", "slug_type")
      .orderby(aq.desc("count"))
      .filter((d) => op.rank() <= 5)
      .orderby("item_type", "slug_type", aq.desc("count"));
  }
  async selectRows() {
    for (let i = 0; i < 10; i++) {
      this.dt
        .params({ value: randomNumbers[i] })
        .filter((d, $) => d.column00 === $.value);
    }
  }
  async createIndex() {
    return "n/a";
  }
  async selectRowsWithIndex() {
    return "n/a";
  }
  async updateRows() {
    return "n/a";
  }
  async deleteRows() {
    return "n/a";
  }
  async insertRows() {
    return "n/a";
  }
  async cleanup() {
    return "n/a";
  }
}

export default ArqueroBenchmark;
