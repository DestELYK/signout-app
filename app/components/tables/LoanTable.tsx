import { Button, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useNavigate, useSearchParams } from "@remix-run/react";
import {
    MantineReactTable,
    MRT_ColumnDef,
    MRT_ColumnFiltersState,
    MRT_RowSelectionState,
    useMantineReactTable,
} from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { INITIAL_PAGE_SIZE, STATUS_OPTIONS } from "~/utils/consts";
import { DataReturn, ItemStatusData, LoanData, TagData } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import HoverBadge from "../HoverBadge";
import StatusBadge from "../StatusBadge";
import TagGroup from "../tags/TagGroup";
import HighlightCell from "./HighlightCell";

export interface LoanTableProps {
    data?: LoanData[];
    totalCount?: number;
    tags: TagData[];
}

export default function LoanTable({ data, totalCount, tags }: LoanTableProps) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([
        {
            id: "status",
            value:
                STATUS_OPTIONS.find(
                    (status) =>
                        status.id === searchParams.get("status") ||
                        status.name === searchParams.get("status")
                )?.name ?? "",
        },
        { id: "person", value: searchParams.get("person") ?? "" },
        { id: "items", value: searchParams.get("items") ?? "" },
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
                size: 5,
            },
            {
                id: "status",
                header: "Status",
                size: 120,
                filterVariant: "select",
                mantineFilterSelectProps: {
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
                size: 150,
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
                size: 150,
                accessorFn: (loan) => {
                    return loan.items.map((item) => item.name).join(", ");
                },
                Cell: ({ cell, table }) => <HighlightCell cell={cell} table={table} />,
            },
            {
                accessorKey: "createdDate",
                header: "Date",
                enableColumnFilter: false,
                mantineFilterDateInputProps: {},
                size: 200,
                accessorFn: (loan) => {
                    return new Date(loan.dateLoaned);
                },
                Cell: ({ cell }) => {
                    const date = cell.getValue<Date>();

                    return (
                        <Text size="sm" lineClamp={2}>
                            {formatDate(date, {
                                month: "long",
                                day: "2-digit",
                                year: "numeric",
                            })}
                            <b>{` (${dateDiff({
                                date: date,
                            })})`}</b>
                        </Text>
                    );
                },
            },
            {
                accessorKey: "tags",
                header: "Tags",
                size: 100,
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
        enableColumnResizing: false,
        enableDensityToggle: false,
        enableRowDragging: false,
        enableStickyHeader: false,
        enableColumnOrdering: false,
        enableColumnActions: false,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilters: true,
        enableFilterMatchHighlighting: true,
        enableTableFooter: true,
        enableRowSelection: true,
        manualFiltering: true,
        manualPagination: true,
        positionActionsColumn: "last",
        pageCount: totalCount ?? 0,
        rowCount: totalCount,
        mantineTableContainerProps: {
            style: { height: "calc(100dvh - 19rem)", minHeight: 300 },
        },
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
        },
        positionToolbarAlertBanner: "bottom",
        onRowSelectionChange: setRowSelection,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getRowId: (row: LoanData) => row.id.toString(),
        mantineTableBodyRowProps: (row) => ({
            onClick: () => navigate(`/loans/${row.row.original.id}`),
            style: {
                cursor: "pointer",
                fontSize: "sm",
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

                columnFilters
                    .filter((f) =>
                        globalFilter && globalFilter.length > 0
                            ? f.id !== "person" && f.id !== "items"
                            : true
                    )
                    .forEach((filter) => {
                        if (typeof filter.value === "string" && filter.value.length > 0) {
                            switch (filter.id) {
                                case "status":
                                    const status = STATUS_OPTIONS.find(
                                        (status) => status.name === filter.value
                                    );
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
                }
                if (pagination.pageIndex > 0) {
                    prev.set("page", pagination.pageIndex.toString());
                }
                if (pagination.pageSize !== INITIAL_PAGE_SIZE) {
                    prev.set("limit", pagination.pageSize.toString());
                }
                return prev;
            },
            { replace: true }
        );
    }, [columnFilters, globalFilter, pagination]);

    return <MantineReactTable table={table} />;
}
