import {
  createColumnHelper,
  createTable,
  getCoreRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  Table,
} from "@tanstack/table-core";
import { data, DataItem } from "./data";
import deepmerge from "deepmerge";
import fs from "node:fs/promises";

const renderCsv = <TItem extends Record<string, unknown>>(
  table: Table<TItem>,
  delimiter = ",",
  postProcess?: (values: string[][]) => string[][]
) => {
  const headers = table
    .getHeaderGroups()
    .map((headerGroup) =>
      headerGroup.headers.map((header) =>
        [header.column.columnDef.header?.toString()].concat(
          Array.from({ length: header.colSpan - 1 })
        )
      )
    );
  const rows = table
    .getRowModel()
    .rows.map((row) =>
      row
        .getVisibleCells()
        .map((cell) =>
          typeof cell.column.columnDef.cell === "string"
            ? cell.column.columnDef.cell
            : cell.column.columnDef.cell?.(cell.getContext())
        )
    );
  const finalValues = postProcess?.([...headers, ...rows]) ?? [
    ...headers,
    ...rows,
  ];

  return finalValues.map((row) => row.join(delimiter)).join("\n");
};

const columnHelper = createColumnHelper<DataItem>();
const columns = [
  columnHelper.group({
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
    ],
  }),
  columnHelper.group({
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
      columnHelper.display({
        id: "isAdult",
        header: "Is adult?",
        cell: ({ row }) => (row.original.age >= 18 ? "Yes" : "No"),
      }),
    ],
  }),
];

const table = createTable({
  columns,
  data,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getGroupedRowModel: getGroupedRowModel(),
  onStateChange: () => {},
  renderFallbackValue: "N/A",
  state: {
    sorting: [{ id: "visits", desc: true }],
    columnFilters: [{ id: "status", value: "Single" }],
    columnPinning: { left: ["status"] },
    columnOrder: ["lastName", "firstName", "visits", "status", "isAdult"],
  },
});

table.setOptions((prev) =>
  deepmerge(prev, {
    state: table.initialState,
  })
);

const csv = renderCsv(table, ",", (values) => [
  ...Object.entries({
    This: "is",
    some: "random",
    extra: "data",
  }),
  [],
  ...values,
]);

await fs.writeFile("output.csv", csv);
