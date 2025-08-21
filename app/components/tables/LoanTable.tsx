/**
 * LoanTable Component
 *
 * A data table for displaying and managing loan information
 * with features including pagination, filtering, sorting, and
 * bulk operations. Integrates with the loan management system.
 *
 *
 * @module LoanTable
 *
 * @author Kyle Dunn
 */

import { Button, Stack, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useNavigate, useSearchParams } from "@remix-run/react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_RowSelectionState,
  MRT_SortingState,
  useMantineReactTable,
} from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { INITIAL_PAGE_SIZE, STATUS_OPTIONS } from "~/utils/consts";
import { DataReturn, ItemStatusData, LoanData, TagData } from "~/utils/types.server";
import { dateDiff, formatFullName } from "~/utils/utils";
import DateDisplay from "../DateDisplay";
import HoverBadge from "../HoverBadge";
import StatusBadge from "../StatusBadge";
import TagGroup from "../tags/TagGroup";
import HighlightCell from "./HighlightCell";

/**
 * Props for the LoanTable component
 */
export interface LoanTableProps {
  /** Array of loan data to display */
  data?: LoanData[];
  /** Total count for pagination */
  totalCount?: number;
  /** Available tags for filtering */
  tags: TagData[];
}

/**
 * A comprehensive loan management table with advanced features
 * Provides complete loan data display and management capabilities
 *
 * @param props - The component props
 * @returns The rendered loan table component
 */
export default function LoanTable({ data, totalCount, tags }: LoanTableProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([
    {
      id: "status",
      value:
        searchParams.getAll("status").length > 0
          ? searchParams
              .getAll("status")
              .map(
                (statusParam) =>
                  STATUS_OPTIONS.find(
                    (status) => status.id === statusParam || status.name === statusParam
                  )?.name
              )
              .filter(Boolean)
          : [],
    },
    { id: "person", value: searchParams.get("person") ?? "" },
    { id: "items", value: searchParams.get("items") ?? "" },
    {
      id: "tags",
      value: tags
        .filter((tag) => searchParams.getAll("tag").includes(tag.id.toString()))
        .map((tag) => tag.name),
    },
    {
      id: "createdDate",
      value: [
        searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : null,
        searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : null,
      ],
    },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: INITIAL_PAGE_SIZE });

  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [sorting, setSorting] = useState<MRT_SortingState>(() => {
    const sortByParams = searchParams.getAll("sortBy");
    const orderParams = searchParams.getAll("order");

    if (sortByParams.length > 0) {
      return sortByParams.map((sortBy, index) => ({
        id: sortBy,
        desc: (orderParams[index] || "desc") === "desc",
      }));
    }

    return [{ id: "createdDate", desc: true }];
  });

  const tagNames = tags.map((tag) => tag.name);

  const notificationId = "item-delete";

  const deleteFetcher = useFetcherWithErrorHandler<DataReturn<number>>(
    (data) => {
      if (data.data !== undefined) {
        setRowSelection({});
        notifications.update({
          id: notificationId,
          message: `Deleted ${data.data} items successfully`,
          loading: false,
          autoClose: 5000,
          withCloseButton: true,
        });
      }
    },
    (error) => {
      notifications.update({
        id: notificationId,
        message: `Failed to delete items`,
        color: "red",
        loading: false,
        autoClose: 5000,
        withCloseButton: true,
      });
    }
  );

  const columns = useMemo<MRT_ColumnDef<LoanData>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableColumnFilter: false,
        size: 80,
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        filterVariant: "multi-select",
        mantineFilterMultiSelectProps: {
          data: STATUS_OPTIONS.map((status) => status.name),
          style: { minWidth: 120 },
        },
        accessorFn: (loan) => {
          return loan.status;
        },
        Cell: ({ cell }) => {
          const status = cell.getValue<ItemStatusData>();
          return <StatusBadge status={status} />;
        },
      },
      {
        id: "person",
        header: "Person",
        accessorFn: (loan) => {
          return formatFullName(loan.person);
        },
        Cell: ({ cell, table, row }) => {
          const role = row.original.person.role;
          return (
            <Stack gap={0}>
              <HighlightCell cell={cell} table={table} />
              <HoverBadge
                name={role?.name ?? "Unknown"}
                color={role?.color ?? "gray"}
                description={role?.description}
                badgeProps={{ size: "xs", variant: "dot" }}
              />
            </Stack>
          );
        },
      },
      {
        id: "items",
        header: "Items",
        accessorFn: (loan) => {
          return loan.items.map((item) => item.name).join(", ");
        },
        Cell: ({ cell, table }) => <HighlightCell cell={cell} table={table} />,
      },
      {
        accessorKey: "createdDate",
        header: "Date",
        enableColumnFilter: true,
        accessorFn: (loan) => {
          return new Date(loan.dateLoaned);
        },
        Cell: ({ cell }) => {
          const date = cell.getValue<Date>();

          return (
            <Stack gap={0}>
              <DateDisplay
                date={date}
                formatOptions={{
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                }}
                size="xs"
              />
              <Text size="xs" c="dimmed" fw="bold">
                ({dateDiff({ date: date })})
              </Text>
            </Stack>
          );
        },
        Filter: ({ column, table }) => {
          const columnFilterValue = column.getFilterValue() as
            | [Date | null, Date | null]
            | undefined;

          return (
            <DatePickerInput
              type="range"
              placeholder="Pick date range"
              value={columnFilterValue || [null, null]}
              onChange={(value) => {
                column.setFilterValue(value);
              }}
              clearable
              size="xs"
              style={{ minWidth: 200 }}
            />
          );
        },
      },
      {
        accessorKey: "tags",
        header: "Tags",
        enableSorting: false,
        filterVariant: "multi-select",
        mantineFilterSelectProps: {
          data: tagNames,
        },
        accessorFn: (loan) => {
          return loan.tags;
        },
        Cell: ({ cell }) => {
          const tags = cell.getValue<TagData[]>();
          return <TagGroup tags={tags} badgeProps={{ size: "xs" }} />;
        },
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns: columns,
    data: data ?? [],
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    layoutMode: "semantic",
    enableDensityToggle: false,
    enableRowDragging: false,
    enableStickyHeader: false,
    enableColumnOrdering: false,
    enableColumnActions: false,
    enableSorting: true,
    enableHiding: false,
    enableColumnFilters: true,
    enableFilterMatchHighlighting: true,
    enableTableFooter: true,
    enableRowSelection: true,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    positionActionsColumn: "last",
    pageCount: totalCount ?? 0,
    rowCount: totalCount,
    initialState: {
      showGlobalFilter: true,
      showColumnFilters: true,
    },
    state: {
      showLoadingOverlay: data === undefined,
      columnFilters: columnFilters,
      globalFilter: globalFilter,
      pagination: pagination,
      rowSelection: rowSelection,
      sorting: sorting,
    },
    positionToolbarAlertBanner: "bottom",
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getRowId: (row: LoanData) => row.id.toString(),
    mantineTableBodyRowProps: (row) => ({
      onClick: () => navigate(`/loans/${row.row.original.id}`),
      style: {
        cursor: "pointer",
        fontSize: "xs",
      },
    }),
    renderTopToolbarCustomActions: ({ table }) => {
      const selection = Object.entries(rowSelection);
      return (
        <Button
          disabled={selection.length === 0}
          variant="outline"
          color="red"
          onClick={() => {
            modals.openConfirmModal({
              title: "Delete Items",
              children: (
                <>
                  {`Are you sure you want to delete ${selection.length} selected items?`}
                  <br />
                  <br />
                  <Text c="red">This cannot be undone!</Text>
                </>
              ),
              centered: true,
              onConfirm: () => {
                notifications.show({
                  id: notificationId,
                  message: `Deleting ${selection.length} items...`,
                  loading: true,
                  autoClose: false,
                  withCloseButton: false,
                });
                deleteFetcher.submit(
                  { loanIds: selection.map(([id]) => id) },
                  {
                    action: "/loans/list",
                    method: "DELETE",
                    encType: "application/json",
                  }
                );
              },
              labels: {
                cancel: "Cancel",
                confirm: "Delete",
              },
              confirmProps: { color: "red" },
            });
          }}
        >
          Delete Items
        </Button>
      );
    },
  });

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const mappedFilters = columnFilters.map((filter) => ({
          [filter.id]: filter.value,
        }));

        !("q" in mappedFilters) && prev.delete("q");
        !("page" in mappedFilters) && prev.delete("page");
        !("limit" in mappedFilters) && prev.delete("limit");
        !("status" in mappedFilters) && prev.delete("status");
        !("person" in mappedFilters) && prev.delete("person");
        !("items" in mappedFilters) && prev.delete("items");
        !("tag" in mappedFilters) && prev.delete("tag");
        !("dateFrom" in mappedFilters) && prev.delete("dateFrom");
        !("dateTo" in mappedFilters) && prev.delete("dateTo");
        prev.delete("sortBy");
        prev.delete("order");

        columnFilters
          .filter((f) =>
            globalFilter && globalFilter.length > 0 ? f.id !== "person" && f.id !== "items" : true
          )
          .forEach((filter) => {
            if (typeof filter.value === "string" && filter.value.length > 0) {
              switch (filter.id) {
                case "status":
                  const status = STATUS_OPTIONS.find((status) => status.name === filter.value);
                  if (status) {
                    prev.set(filter.id, status.id);
                  }
                  break;
                default:
                  prev.set(filter.id, filter.value);
                  break;
              }
            } else if (Array.isArray(filter.value)) {
              // Handle date range filter
              if (filter.id === "createdDate") {
                const [dateFrom, dateTo] = filter.value as [Date | null, Date | null];
                if (dateFrom) {
                  prev.set("dateFrom", dateFrom.toISOString().split("T")[0]);
                }
                if (dateTo) {
                  prev.set("dateTo", dateTo.toISOString().split("T")[0]);
                }
              } else {
                // Handle other array filters (like tags)
                filter.value.forEach((val) => {
                  if (typeof val === "string" && val.length > 0) {
                    switch (filter.id) {
                      case "tags":
                        const tag = tags.find((tag) => tag.name === val);
                        if (tag) {
                          prev.append("tag", tag.id.toString());
                        }
                        break;
                      default:
                        prev.append(filter.id, val);
                        break;
                    }
                  }
                });
              }
            }
          });
        if (globalFilter) {
          prev.set("q", globalFilter);
        } else {
          prev.delete("q");
        }
        if (pagination.pageIndex > 0) {
          prev.set("page", pagination.pageIndex.toString());
        }
        if (pagination.pageSize !== INITIAL_PAGE_SIZE) {
          prev.set("limit", pagination.pageSize.toString());
        }

        // Add sorting parameters
        if (sorting.length > 0) {
          sorting.forEach((sort) => {
            prev.append("sortBy", sort.id);
            prev.append("order", sort.desc ? "desc" : "asc");
          });
        }

        return prev;
      },
      { replace: true }
    );
  }, [columnFilters, globalFilter, pagination, sorting]);

  return <MantineReactTable table={table} />;
}
