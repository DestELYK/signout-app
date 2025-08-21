/**
 * ItemTable Component
 *
 * A data table component for displaying and managing items
 * with filtering, sorting, selection, and action capabilities.
 * Built with Mantine React Table for -featured data management.
 *
 *
 * @module ItemTable
 *
 * @author Kyle Dunn
 */

import { Badge, Button, Text } from "@mantine/core";
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
import {
  DataReturn,
  ItemData,
  ItemStatusData,
  ItemTypeData,
  LocationData,
  TagData,
} from "~/utils/types.server";
import QRCodePreview from "../qrCode/QRCodePreview";
import HighlightCell from "./HighlightCell";

/**
 * Props for the ItemTable component
 */
export interface ItemTableProps {
  /** Array of item data to display in the table */
  data: ItemData[] | undefined;
  /** Total count of items for pagination */
  totalCount?: number;
  /** Available item statuses for filtering */
  statuses: ItemStatusData[];
  /** Available item types for filtering */
  types: ItemTypeData[];
  /** Available locations for filtering */
  locations: LocationData[];
  /** Available tags for filtering */
  tags: TagData[];
}

/**
 * A comprehensive data table for item management with advanced features
 * Provides filtering, sorting, selection, and bulk operations
 *
 * @param props - The component props
 * @returns The rendered item table component
 */
export default function ItemTable({
  data,
  totalCount,
  statuses,
  types,
  locations,
  tags,
}: ItemTableProps) {
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
    {
      id: "name",
      value: searchParams.get("name") ?? "",
    },
    {
      id: "type",
      value: types
        .filter(
          (type) =>
            searchParams.getAll("type").includes(type.id.toString()) ||
            searchParams.getAll("type").includes(type.name)
        )
        .map((type) => type.name),
    },
    {
      id: "location",
      value: locations
        .filter(
          (location) =>
            searchParams.getAll("location").includes(location.id.toString()) ||
            searchParams.getAll("location").includes(location.name)
        )
        .map((location) => location.name),
    },
    {
      id: "tags",
      value: tags
        .filter((tag) => searchParams.getAll("tag").includes(tag.id.toString()))
        .map((tag) => tag.name),
    },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: INITIAL_PAGE_SIZE });

  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [sorting, setSorting] = useState<MRT_SortingState>(() => {
    const sortByParams = searchParams.getAll("sortBy");
    const orderParams = searchParams.getAll("order");

    if (sortByParams.length > 0) {
      return sortByParams.map((field, index) => ({
        id: field,
        desc: (orderParams[index] || "desc") === "desc",
      }));
    }

    // Default sorting
    return [
      {
        id: "createdDate",
        desc: true,
      },
    ];
  });

  const typeNames = types.map((type) => type.name);
  const locationNames = locations.map((location) => location.name);
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

  const columns = useMemo<MRT_ColumnDef<ItemData>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableColumnFilter: false,
        size: 80,
      },
      {
        accessorKey: "uuid",
        header: "UUID",
        enableColumnFilter: false,
        size: 80,
        accessorFn: (item) => item.uuid,
        Cell: ({ cell }) => {
          const uuid = cell.getValue<string>();
          return <QRCodePreview qrCode={uuid} scale={1} type="hover" />;
        },
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        filterVariant: "multi-select",
        mantineFilterMultiSelectProps: {
          data: statuses.map((status) => status.name),
          style: { minWidth: 150 },
        },
        accessorFn: (item) => item.status,
        Cell: ({ cell }) => {
          const status = cell.getValue<ItemStatusData>();
          if (status) {
            return (
              <Badge color={status.color} autoContrast>
                {status.name}
              </Badge>
            );
          }
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ cell, table }) => <HighlightCell cell={cell} table={table} />,
      },
      {
        accessorKey: "type",
        header: "Type",
        filterVariant: "multi-select",
        mantineFilterMultiSelectProps: {
          data: typeNames,
        },
        accessorFn: (item) => item.type?.name,
      },
      {
        accessorKey: "location",
        header: "Location",
        filterVariant: "multi-select",
        mantineFilterMultiSelectProps: {
          data: locationNames,
        },
        accessorFn: (item) => item.location?.name,
      },
      {
        accessorKey: "tags",
        header: "Tags",
        enableSorting: false,
        filterVariant: "multi-select",
        mantineFilterMultiSelectProps: {
          data: tagNames,
        },
        Cell: ({ cell }) => {
          return cell.getValue<TagData[]>().map((tag) => (
            <Badge key={tag.id} color={tag.color} variant="filled" size="xs" autoContrast>
              {tag.name}
            </Badge>
          ));
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
    getRowId: (row: ItemData) => row.id.toString(),
    mantineTableBodyRowProps: (row) => ({
      onClick: () => navigate(`/items/${row.row.original.id}`),
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
                  { itemIds: selection.map(([id]) => id) },
                  {
                    action: "/items/list",
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
        !("name" in mappedFilters) && prev.delete("name");
        !("type" in mappedFilters) && prev.delete("type");
        !("location" in mappedFilters) && prev.delete("location");
        !("tag" in mappedFilters) && prev.delete("tag");
        prev.delete("sortBy");
        prev.delete("order");

        columnFilters.forEach((filter) => {
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
