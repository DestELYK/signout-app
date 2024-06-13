import { Highlight } from "@mantine/core";
import { MRT_Cell, MRT_RowData, MRT_TableInstance } from "mantine-react-table";

export interface HighlightCellProps<T extends MRT_RowData> {
  cell: MRT_Cell<T>;
  table: MRT_TableInstance<T>;
}

export default function HighlightCell<T extends MRT_RowData>({
  cell,
  table,
}: HighlightCellProps<T>) {
  const value = cell.getValue<string>();
  let highlight = table.getState().globalFilter;

  if (
    typeof highlight !== "string" ||
    highlight === undefined ||
    highlight === ""
  ) {
    highlight = cell.column.getFilterValue();

    if (Array.isArray(highlight)) {
      highlight = highlight[0];
    }
  }

  if (
    typeof highlight !== "string" ||
    highlight === undefined ||
    highlight === ""
  ) {
    highlight = "";
  }

  return (
    <Highlight size="sm" lineClamp={2} highlight={highlight.split(" ")}>
      {value}
    </Highlight>
  );
}
