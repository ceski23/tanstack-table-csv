import {
  Cell,
  CellContext,
  ColumnDefTemplate,
  Table,
} from "@tanstack/table-core";

export const renderCsv = <TItem extends Record<string, unknown>>(
  table: Table<TItem>,
  delimiter = ",",
  postProcess?: (values: string[][]) => string[][]
) => {
  const flexRender = (
    cell: ColumnDefTemplate<CellContext<TItem, string>> | undefined,
    context: CellContext<TItem, string>
  ) =>
    (typeof cell === "string" ? cell : cell?.(context)) ??
    table.options.renderFallbackValue;

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
