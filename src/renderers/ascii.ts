import {
  Cell,
  CellContext,
  ColumnDefTemplate,
  Table,
} from "@tanstack/table-core";
import { AsciiTable3 } from "ascii-table3";

export const renderAscii = <TItem extends Record<string, unknown>>(
  table: Table<TItem>
) => {
  const flexRender = (
    cell: ColumnDefTemplate<CellContext<TItem, string>> | undefined,
    context: CellContext<TItem, string>
  ) =>
    (typeof cell === "string" ? cell : cell?.(context)) ??
    table.options.renderFallbackValue;

  const headers = table
    .getHeaderGroups()
    .flatMap((headerGroup) =>
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
        ? // For cells with repeated values, render empty string
          ""
        : // Otherwise, just render the regular cell
          flexRender(cell.column.columnDef.cell, cell.getContext())
    )
  );

  return new AsciiTable3()
    .setHeading(...headers)
    .addRowMatrix(rows)
    .setStyle("unicode-single")
    .toString();
};
