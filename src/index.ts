import {
  createColumnHelper,
  createTable,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
} from "@tanstack/table-core";
import { createDataItem, DataItem } from "./data";
import deepmerge from "deepmerge";
import fs from "node:fs/promises";
import { renderCsv } from "./renderers/csv";
import { renderAscii } from "./renderers/ascii";

const columnHelper = createColumnHelper<DataItem>();
const columns = [
  {
    header: "Name",
    columns: [
      columnHelper.accessor((item) => item.firstName, {
        id: "firstName",
        header: "First Name",
      }),
      columnHelper.accessor((item) => item.lastName, {
        id: "lastName",
        header: "Last Name",
      }),
      columnHelper.accessor((item) => `${item.firstName} ${item.lastName}`, {
        id: "fullName",
        header: "Full Name",
      }),
    ],
  },
  {
    header: "Info",
    columns: [
      columnHelper.accessor((item) => item.visits, {
        id: "visits",
        header: "Visits",
      }),
      columnHelper.accessor((item) => item.status, {
        id: "status",
        header: "Status",
      }),
      columnHelper.accessor((item) => (item.age >= 18 ? "Yes" : "No"), {
        id: "isAdult",
        header: "Is adult?",
      }),
    ],
  },
];

const table = createTable({
  columns: columns.flatMap((col) => col.columns ?? []),
  // columns,
  data: Array.from({ length: 50 }, createDataItem),
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getGroupedRowModel: getGroupedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onStateChange: () => {},
  renderFallbackValue: "",
  state: {},
  //   debugTable: true,
  initialState: {
    sorting: [{ id: "visits", desc: true }],
    // columnFilters: [{ id: "status", value: "Single" }],
    columnPinning: { left: ["status"] },
    // columnOrder: ["lastName", "firstName", "visits", "status", "isAdult"],
    grouping: ["isAdult"],
    expanded: true,
  },
});

table.setOptions((prev) =>
  deepmerge(prev, {
    state: table.initialState,
  })
);

// Render table to CSV
await fs.writeFile(
  "output.csv",
  renderCsv(table, ",", (values) => [
    // ...Object.entries({
    //   This: "is",
    //   some: "random",
    //   extra: "data",
    // }),
    // [],
    ...values,
  ])
);

// Render table to ASCII
console.log(renderAscii(table));
