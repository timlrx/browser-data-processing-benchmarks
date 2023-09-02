/**
 * @abstract
 */
class BaseBenchmark {
  constructor() {
    if (this.constructor == BaseBenchmark) {
      throw new Error("Abstract classes can't be instantiated");
    }
  }
  async fetch() {
    throw new Error("Not implemented");
  }
  async load() {
    throw new Error("Not implemented");
  }
  async topLevelMetrics() {
    throw new Error("Not implemented");
  }
  async salesPerDay() {
    throw new Error("Not implemented");
  }
  async topCountriesByItemType() {
    throw new Error("Not implemented");
  }
  async selectRows() {
    throw new Error("Not implemented");
  }
  async createIndex() {
    throw new Error("Not implemented");
  }
  async selectRowsWithIndex() {
    throw new Error("Not implemented");
  }
  async updateRows() {
    throw new Error("Not implemented");
  }
  async deleteRows() {
    throw new Error("Not implemented");
  }
  async cleanup() {
    throw new Error("Not implemented");
  }
  async result() {
    throw new Error("Not implemented");
  }
  async compute() {
    return 1 + 1;
  }
}

export default BaseBenchmark;
