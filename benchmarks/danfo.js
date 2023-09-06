import { readCSV, Dt } from "danfojs";
import BaseBenchmark from "./base";
import { csvPath } from "../constants";
import randomNumbers from "../numbers.json";

const log = (...args) => console.log(...args);

class DanfoBenchmark extends BaseBenchmark {
  constructor() {
    super();
    this.df = null;
  }
  async fetch() {
    this.df = await readCSV(csvPath);
    this.df.drop({ index: [1000000], inplace: true });
    this.df.rename({ "": "column00" }, { inplace: true });
  }
  async load() {
    return "n/a";
  }
  async topLevelMetrics() {
    const s = this.df["amount_paid_usd"];
    s.max();
    s.mean();
    s.count();
  }
  async salesPerDay() {
    const dateCol = this.df["utc_date"].map((x) => {
      return new Date(x * 1000).toISOString().slice(0, 10);
    });
    this.df.addColumn("date", dateCol, { inplace: true });
    const grp = this.df.groupby(["date"]);
    grp.col(["amount_paid_usd"]).sum();
    grp.count();
  }
  async topCountriesByItemType() {
    const item_slug_type = this.df["item_type"].str.concat(
      this.df["slug_type"].values
    );
    this.df.addColumn("item_slug_type", item_slug_type, { inplace: true });
    const tempDf = this.df
      .groupby(["country", "item_slug_type"])
      .col(["country"])
      .count();
    const item_slug_type_list = new Set(tempDf["item_slug_type"].values);
    for (const i of item_slug_type_list) {
      tempDf
        .query(tempDf["item_slug_type"].eq(i))
        .sortValues("country_count", { ascending: false })
        .head(5);
    }
  }
  async selectRows() {
    this.df.ctypes.print();
    for (let i = 0; i < 10; i++) {
      this.df.query(this.df["column00"].eq(randomNumbers[i])).print();
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

export default DanfoBenchmark;
