/**
 * HighlightCell Component
 *
 * A specialized table cell component that provides text highlighting
 * functionality based on global filters or column-specific filters.
 * Integrates with Mantine React Table to provide search highlighting.
 *
 *
 * @module HighlightCell
 *
 * @author Kyle Dunn
 */

import { Highlight } from "@mantine/core";
import { MRT_Cell, MRT_RowData, MRT_TableInstance } from "mantine-react-table";

/**
 * Props for the HighlightCell component
 * @template T - The table data type
 */
export interface HighlightCellProps<T extends MRT_RowData> {
  /** The table cell instance from Mantine React Table */
  cell: MRT_Cell<T>;
  /** The table instance for accessing filters and state */
  table: MRT_TableInstance<T>;
}

/**
 * A table cell component with intelligent text highlighting
 * Highlights text based on global or column filters from the table
 *
 * @template T - The table data type
 * @param props - The component props
 * @returns The rendered highlight cell component
 */
export default function HighlightCell<T extends MRT_RowData>({
  cell,
  table,
}: HighlightCellProps<T>) {
  const value = cell.getValue<string>();
  let highlight = table.getState().globalFilter;

  // If no global filter, try column-specific filter
  if (typeof highlight !== "string" || highlight === undefined || highlight === "") {
    highlight = cell.column.getFilterValue();

    // Handle array filters by taking first element
    if (Array.isArray(highlight)) {
      highlight = highlight[0];
    }
  }

  // Ensure highlight is a valid string
  if (typeof highlight !== "string" || highlight === undefined || highlight === "") {
    highlight = "";
  }

  return (
    <Highlight size="xs" lineClamp={2} highlight={highlight.split(" ")}>
      {value}
    </Highlight>
  );
}
