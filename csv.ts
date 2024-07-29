import {
  Cell,
  CellContext,
  ColumnDefTemplate,
  createColumnHelper,
  createTable,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  Table,
} from "@tanstack/table-core";
import { createDataItem, DataItem } from "./data";
import deepmerge from "deepmerge";
import fs from "node:fs/promises";

const renderCsv = <TItem extends Record<string, unknown>>(
  table: Table<TItem>,
  delimiter = ",",
  postProcess?: (values: string[][]) => string[][]
) => {
  const flexRender = (
    cell: ColumnDefTemplate<CellContext<TItem, string>> | undefined,
    context: CellContext<TItem, string>
  ) => (typeof cell === "string" ? cell : cell?.(context));

  const headers = table
    .getHeaderGroups()
    .map((headerGroup) =>
      headerGroup.headers.map((header) =>
        [header.column.columnDef.header?.toString()].concat(
          Array.from({ length: header.colSpan - 1 })
        )
      )
    );
  const rows = table.getRowModel().rows.map((row) =>
    row.getVisibleCells().map((cell: Cell<TItem, string>) =>
      cell.getIsGrouped()
        ? // If it's a grouped cell, render the regular cell
          flexRender(cell.column.columnDef.cell, cell.getContext())
        : cell.getIsAggregated()
        ? // If the cell is aggregated, use the Aggregated renderer for cell
          flexRender(
            cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
            cell.getContext()
          )
        : cell.getIsPlaceholder()
        ? // For cells with repeated values, render null
          null
        : // Otherwise, just render the regular cell
          flexRender(cell.column.columnDef.cell, cell.getContext())
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
        cell: ({ getValue }) => `"${getValue().toLocaleString("en")}"`,
        aggregatedCell: ({ getValue }) =>
          `"${getValue().toLocaleString("en")}"`,
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
  // columns: columns.flatMap((col) => col.columns ?? []),
  columns,
  data: Array.from({ length: 100 }, createDataItem),
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getGroupedRowModel: getGroupedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onStateChange: () => {},
  renderFallbackValue: "N/A",
  state: {},
  debugTable: true,
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

const csv = renderCsv(table, ",", (values) => [
  // ...Object.entries({
  //   This: "is",
  //   some: "random",
  //   extra: "data",
  // }),
  // [],
  ...values,
]);

await fs.writeFile("output.csv", csv);
