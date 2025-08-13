import { useNavigate, useNavigation, useSearchParams } from "@remix-run/react";
import {
    MRT_ColumnDef,
    MRT_ColumnFiltersState,
    MRT_ColumnOrderState,
    MRT_PaginationState,
    MRT_RowData,
    MRT_TableOptions,
    MantineReactTable,
    useMantineReactTable,
} from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import { INITIAL_PAGE_SIZE, MAX_PAGE_SIZE } from "~/utils/consts";
import { parseNumber } from "~/utils/utils";

// TODO - Move to separate files

export interface TableViewProps<T extends MRT_RowData> {
    data: T[] | undefined;
    columns: MRT_ColumnDef<T>[];
    totalCount?: number;
    columnOrder?: MRT_ColumnOrderState;
    columnFilters?: { id: string; type: "string" | "array" }[];
    handleColumnFilter?: (
        id: string,
        value: string | string[],
        type: "set" | "get"
    ) => string | string[] | undefined;
    onRowClick?: (row: T) => void;
    renderRowActions?: MRT_TableOptions<T>["renderRowActions"];
    renderDetailPanel?: MRT_TableOptions<T>["renderDetailPanel"];
    renderTopToolbarCustomActions?: MRT_TableOptions<T>["renderTopToolbarCustomActions"];
}

export default function TableView<T extends MRT_RowData & { id: number }>({
    data,
    columns,
    totalCount,
    columnOrder,
    columnFilters,
    handleColumnFilter,
    onRowClick,
    renderRowActions,
    renderDetailPanel,
    renderTopToolbarCustomActions,
}: TableViewProps<T>) {
    const navigation = useNavigation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [globalFilter, setGlobalFilter] = useState<string | undefined>(undefined);

    const [enableColumnFilters, setEnableColumnFilters] = useState<boolean>(true);

    const searchLimit = searchParams.get("limit");
    const searchPage = searchParams.get("page");

    const pageSize = parseNumber(searchLimit, INITIAL_PAGE_SIZE, undefined, MAX_PAGE_SIZE);
    const pageIndex = parseNumber(searchPage, 0);

    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageSize: pageSize,
        pageIndex: pageIndex,
    });

    useEffect(() => {
        if (
            (pageSize && pagination.pageSize != pageSize) ||
            (pageIndex && pagination.pageIndex != pageIndex)
        ) {
            setPagination((prev) => {
                if (pageSize && prev.pageSize != pageSize) {
                    prev.pageSize = pageSize;
                }
                if (pageIndex && prev.pageIndex != pageIndex) {
                    prev.pageIndex = pageIndex;
                }
                return prev;
            });
        }
    }, [pageSize, pageIndex]);

    const searchQuery = searchParams.get("q");

    useEffect(() => {
        if (searchQuery !== globalFilter) {
            setGlobalFilter(searchQuery ?? undefined);
        }
    }, [searchQuery]);

    const [_columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([]);

    const filters = useMemo(
        () =>
            columnFilters?.map((filter) => {
                const param = searchParams.get(filter.id);

                if (filter.type === "array") {
                    return {
                        id: filter.id,
                        value: param ? param.split(",") : null,
                    };
                } else {
                    return {
                        id: filter.id,
                        value: param ? param : null,
                    };
                }
            }),
        [searchParams]
    );

    useEffect(() => {
        const newFilters: MRT_ColumnFiltersState = [];

        filters?.forEach((filter) => {
            if (filter.value) {
                const newValue = handleColumnFilter?.(filter.id, filter.value, "get");

                if (newValue === undefined) {
                    return;
                }
                newFilters.push({
                    id: filter.id,
                    value: newValue,
                });
            }
        }) ?? [];

        if (newFilters != _columnFilters) {
            setColumnFilters(newFilters);
        }
    }, [filters, handleColumnFilter]);

    const table = useMantineReactTable<T>({
        data: data ?? [],
        columns: columns,
        getRowId: (row: T) => row.id.toString(),
        enableColumnResizing: false,
        enableDensityToggle: false,
        enableRowDragging: false,
        enableStickyHeader: true,
        enableColumnOrdering: false,
        enableColumnActions: false,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilters: enableColumnFilters,
        manualFiltering: true,
        manualPagination: true,
        enableFilterMatchHighlighting: true,
        renderDetailPanel: renderDetailPanel ?? undefined,
        enableTableFooter: true,
        mantineTableContainerProps: {
            style: { height: "calc(100dvh - 19rem)", minHeight: 300 },
        },
        mantineTableBodyRowProps: (row) => ({
            onClick: () => onRowClick?.(row.row.original),
            style: {
                cursor: onRowClick ? "pointer" : undefined,
                fontSize: "sm",
            },
        }),
        renderRowActions: renderRowActions,
        renderTopToolbarCustomActions: renderTopToolbarCustomActions,
        positionActionsColumn: "last",
        enableRowActions: renderRowActions ? true : false,
        pageCount: totalCount ?? 0,
        rowCount: totalCount,
        initialState: {
            showGlobalFilter: true,
            showColumnFilters: true,
        },
        state: {
            showLoadingOverlay: data === undefined,
            showProgressBars: navigation.state === "loading",
            pagination: pagination,
            globalFilter: globalFilter,
            columnFilters: _columnFilters,
            columnOrder: columnOrder,
        },
        onPaginationChange: (value) => {
            const newValue = value instanceof Function ? value(pagination) : value;

            if (newValue.pageSize !== pageSize || newValue.pageIndex !== pageIndex) {
                const newPageSize = parseNumber(
                    newValue.pageSize,
                    INITIAL_PAGE_SIZE,
                    undefined,
                    MAX_PAGE_SIZE
                );
                const newPageIndex = parseNumber(newValue.pageIndex, 0);
                setSearchParams(
                    (prev) => {
                        prev.set("limit", newPageSize.toString());
                        prev.set("page", newPageIndex.toString());
                        return prev;
                    },
                    { replace: true }
                );
            }
        },
        onGlobalFilterChange: (value) => {
            const newValue = value instanceof Function ? value(searchQuery) : value;

            if (newValue !== searchQuery) {
                if (newValue != undefined && typeof newValue === "string" && newValue !== "") {
                    // clear filters when global filter is set
                    setColumnFilters([]);

                    columnFilters?.forEach((filter) => {
                        setSearchParams(
                            (prev) => {
                                prev.delete(filter.id);
                                return prev;
                            },
                            { replace: true }
                        );
                    });
                }

                setEnableColumnFilters(!newValue);

                setGlobalFilter(newValue);
                setSearchParams(
                    (prev) => {
                        if (newValue === undefined || newValue === "") {
                            prev.delete("q");
                        } else {
                            prev.set("q", newValue);
                        }
                        return prev;
                    },
                    { replace: true }
                );
            }
        },
        onColumnFiltersChange: (value) => {
            const newValue = value instanceof Function ? value(_columnFilters) : value;

            const added = newValue.filter(
                (filter) =>
                    !_columnFilters.find((f) => f.id === filter.id && f.value === filter.value)
            );

            const removed = _columnFilters.filter(
                (filter) => !newValue.find((f) => f.id === filter.id && f.value === filter.value)
            );

            if (added.length > 0 || removed.length > 0) {
                setColumnFilters(newValue);
                setSearchParams(
                    (prev) => {
                        removed?.forEach((filter) => {
                            prev.delete(filter.id);
                        });

                        added.forEach((filter) => {
                            const newFilter = handleColumnFilter?.(
                                filter.id,
                                String(filter.value),
                                "set"
                            );

                            prev.set(
                                filter.id,
                                typeof newFilter === "string"
                                    ? newFilter
                                    : newFilter
                                    ? newFilter.join(",")
                                    : String(filter.value)
                            );
                        });

                        return prev;
                    },
                    { replace: true }
                );
            }
        },
    });

    return <MantineReactTable table={table} />;
}
