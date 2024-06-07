import { useNavigate, useNavigation, useSearchParams } from "@remix-run/react";
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_RowData,
  MRT_TableOptions,
  MantineReactTable,
} from "mantine-react-table";
import { useEffect, useState } from "react";

export interface TableViewProps<T extends MRT_RowData> {
  data: T[] | undefined;
  columns: MRT_ColumnDef<T>[];
  totalCount?: number;
  columnOrder?: MRT_ColumnOrderState;
  columnFilters?: MRT_ColumnFiltersState;
  onRowClick?: (row: T) => void;
  onGlobalFilterChange?: (filter: string) => void;
  onColumnFilterChange?: (filters: MRT_ColumnFiltersState) => void;
  renderRowActions?: MRT_TableOptions<T>["renderRowActions"];
  renderDetailPanel?: MRT_TableOptions<T>["renderDetailPanel"];
  renderTopToolbarCustomActions?: MRT_TableOptions<T>["renderTopToolbarCustomActions"];
}

export default function TableView<T extends MRT_RowData & { id: number }>({
  data,
  columns,
  totalCount,
  columnFilters,
  onRowClick,
  onGlobalFilterChange,
  onColumnFilterChange,
  renderRowActions,
  renderDetailPanel,
  renderTopToolbarCustomActions,
}: TableViewProps<T>) {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(
    new URLSearchParams({
      limit: "10",
      page: "0",
    })
  );
  const [pagination, setPagination] = useState({
    pageSize: searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : 10,
    pageIndex: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [_columnFilters, _setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );

  useEffect(() => {
    const pageSize = searchParams.get("limit");
    const pageIndex = searchParams.get("page");

    if (
      pageSize !== pagination.pageSize.toString() ||
      pageIndex !== pagination.pageIndex.toString()
    ) {
      setSearchParams(
        (prev) => {
          prev.set("limit", pagination.pageSize.toString());
          prev.set("page", pagination.pageIndex.toString());
          return prev;
        },
        { replace: true }
      );
    }
  }, [pagination.pageSize, pagination.pageIndex]);

  useEffect(() => {
    onGlobalFilterChange?.(globalFilter);
  }, [globalFilter]);

  useEffect(() => {
    onColumnFilterChange?.(_columnFilters);
  }, [_columnFilters]);

  useEffect(() => {
    _setColumnFilters(_columnFilters);
  }, [columnFilters]);

  return (
    <MantineReactTable
      data={data ?? []}
      columns={columns}
      getRowId={(row) => row.id.toString()}
      enableColumnResizing={false}
      enableDensityToggle={false}
      enableRowDragging={false}
      enableColumnOrdering={false}
      enableColumnActions={false}
      enableSorting={false}
      enableHiding={false}
      enableColumnFilters={true}
      manualFiltering={true}
      manualPagination={true}
      onGlobalFilterChange={setGlobalFilter}
      onColumnFiltersChange={_setColumnFilters}
      renderDetailPanel={renderDetailPanel ?? undefined}
      enableTableFooter={true}
      mantineTableContainerProps={{
        style: { height: "calc(100dvh - 20rem)" },
      }}
      mantineTableBodyRowProps={(row) => ({
        onClick: () => onRowClick?.(row.row.original),
        style: {
          cursor: onRowClick ? "pointer" : undefined,
        },
      })}
      initialState={{
        showGlobalFilter: true,
        showColumnFilters: true,
      }}
      state={{
        showLoadingOverlay: data === undefined,
        showProgressBars: navigation.state === "loading",
        pagination: pagination,
        globalFilter: globalFilter,
        columnFilters: _columnFilters,
      }}
      renderRowActions={renderRowActions}
      renderTopToolbarCustomActions={renderTopToolbarCustomActions}
      positionActionsColumn="last"
      enableRowActions={renderRowActions ? true : false}
      pageCount={Math.ceil(
        totalCount ??
          0 /
            (searchParams.has("limit") ? Number(searchParams.get("limit")) : 30)
      )}
      rowCount={totalCount}
      onPaginationChange={setPagination}
    />
  );
}
