import * as Comlink from "comlink";
import arqueroWorkerUrl from "./workers/arquero-worker?worker&url";
import sqliteWorkerUrl from "./workers/sqlite-worker?worker&url";
import sqliteIndexedWorkerUrl from "./workers/sqlite-indexed-worker?worker&url";
import sqliteOpfsWorkerUrl from "./workers/sqlite-opfs-worker?worker&url";
import duckdbWorkerUrl from "./workers/duckdb-worker?worker&url";
import duckdbHttpfsWorkerUrl from "./workers/duckdb-httpfs-worker?worker&url";

const CONFIGURATION = new Map(
  [
    {
      label: "arquero",
      worker: arqueroWorkerUrl,
    },
    {
      label: "sqlite",
      worker: sqliteWorkerUrl,
    },
    {
      label: "sqlite (indexed)",
      worker: sqliteIndexedWorkerUrl,
    },
    {
      label: "sqlite (indexed)",
      worker: sqliteIndexedWorkerUrl,
    },
    {
      label: "sqlite (OPFS)",
      worker: sqliteOpfsWorkerUrl,
    },
    {
      label: "duckdb",
      worker: duckdbWorkerUrl,
    },
    {
      label: "duckdb (HttpFS)",
      worker: duckdbHttpfsWorkerUrl,
    },
  ].map((obj) => [obj.label, obj])
);

const TESTS = [
  "fetch",
  "load",
  "topLevelMetrics",
  "salesPerDay",
  "topCountriesByItemType",
  "selectRows",
  "createIndex",
  "selectRowsWithIndex",
  "updateRows",
  "insertRows",
  "deleteRows",
  "cleanup",
];

const headers = document.querySelector("thead").firstElementChild;
for (const config of CONFIGURATION.values()) {
  addEntry(headers, config.label);
}

function tableToMarkdown() {
  var markdown_data = [];
  var rows = document.getElementsByTagName("tr");

  // Create header row
  var headerCols = rows[0].querySelectorAll("th");
  var headerRow = [];
  for (var h = 0; h < headerCols.length; h++) {
    var headerCell = headerCols[h].innerHTML.trim();
    headerRow.push(headerCell);
  }
  markdown_data.push("| " + headerRow.join(" | ") + " |");
  markdown_data.push("|" + Array(headerRow.length + 1).join(" --- |"));

  // Create data rows
  for (var i = 1; i < rows.length; i++) {
    var cols = rows[i].querySelectorAll("td, th");
    var dataRow = [];
    for (var j = 0; j < cols.length; j++) {
      var cell = cols[j].innerHTML.replace(/\s{2,}/g, " ").trim();
      dataRow.push(cell);
    }
    markdown_data.push("| " + dataRow.join(" | ") + " |");
  }
  navigator.clipboard.writeText(markdown_data.join("\n"));
}

document.getElementById("copy").addEventListener("click", async (event) => {
  tableToMarkdown();
});

document.getElementById("start").addEventListener("click", async (event) => {
  // @ts-ignore
  event.target.disabled = true;

  // Clear any existing storage state.
  // const cleanWorker = new Worker("./clean-worker.js", { type: "module" });
  // await new Promise((resolve) => {
  //   cleanWorker.addEventListener("message", resolve);
  // });
  // cleanWorker.terminate();

  // Clear timings from the table.
  Array.from(document.getElementsByTagName("tr"), (element) => {
    if (element.parentElement.tagName === "TBODY") {
      // Keep only the first child.
      while (element.firstElementChild.nextElementSibling) {
        element.firstElementChild.nextElementSibling.remove();
      }
    }
  });

  try {
    document.getElementById("error").textContent = "";
    for (const config of CONFIGURATION.values()) {
      const worker = new Worker(config["worker"], { type: "module" });
      try {
        await Promise.race([
          new Promise((resolve) => {
            worker.addEventListener("message", resolve, {
              once: true,
            });
          }),
          new Promise((_, reject) =>
            setTimeout(() => {
              reject(new Error(`${config.label} initialization timeout`));
            }, 20000)
          ),
        ]);

        const BenchmarkWorker = Comlink.wrap(worker);
        const benchmark = await new BenchmarkWorker();

        let tr = document.querySelector("tbody").firstElementChild;
        for (const test of TESTS) {
          console.log(`Running ${config.label} ${test}`);
          const startTime = Date.now();
          const result = await benchmark[test]();
          const elapsed = (Date.now() - startTime) / 1000;
          if (test.startsWith("cleanup")) {
            continue;
          } else if (result === "n/a") {
            addEntry(tr, "n/a");
          } else {
            addEntry(tr, elapsed.toString());
          }
          tr = tr.nextElementSibling;
        }
      } finally {
        worker.terminate();
      }
    }
  } catch (e) {
    document.getElementById("error").textContent = e.stack.includes(e.message)
      ? e.stack
      : `${e.stack}\n${e.message}`;
  } finally {
    // @ts-ignore
    event.target.disabled = false;
  }
});

function addEntry(parent, text) {
  const tag = parent.parentElement.tagName === "TBODY" ? "td" : "th";
  const child = document.createElement(tag);
  child.textContent = text;
  parent.appendChild(child);
}
