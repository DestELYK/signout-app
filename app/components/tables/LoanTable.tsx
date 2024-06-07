import { ActionIcon, Badge, Button, Group, Text, Tooltip } from "@mantine/core";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { IconClipboardCheck } from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { LoanWithTagsAndItems } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import OutstandingBadge from "../OutstandingBadge";
import TableView from "../base/TableView";

export interface LoanTableProps {
  data: LoanWithTagsAndItems[] | undefined;
  totalCount?: number;
}

export default function LoanTable({ data, totalCount }: LoanTableProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const columns = useMemo<MRT_ColumnDef<LoanWithTagsAndItems>[]>(
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
        size: 10,
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: ["Outstanding", "Returned"],
        },
        accessorFn: (loan) => {
          return loan.items.some((item) => !item.dateReturned)
            ? "Outstanding"
            : "Returned";
        },
        Cell: ({ row }) => {
          return (
            <OutstandingBadge
              out={row.original.items.some((item) => !item.dateReturned)}
            />
          );
        },
      },
      {
        accessorKey: "person",
        header: "Person",
        size: 150,
        filterFn: (row, query) =>
          formatFullName(row.original.person).includes(query),
        accessorFn: (loan) => {
          return formatFullName(loan.person);
        },
        Cell: ({ row, renderedCellValue }) => (
          <Text lineClamp={1} size="sm">
            {renderedCellValue}
          </Text>
        ),
      },
      {
        accessorKey: "items",
        header: "Items",
        size: 150,
        filterFn: (row, query) =>
          row.original.items.some((item) => item.item.name.includes(query)),
        accessorFn: (loan) => {
          return loan.items.map((item) => item.item.name).join(", ");
        },
        Cell: ({ renderedCellValue }) => (
          <Text size="sm" lineClamp={2}>
            {renderedCellValue}
          </Text>
        ),
      },
      {
        accessorKey: "createdDate",
        header: "Date",
        enableColumnFilter: false,
        mantineFilterDateInputProps: {},
        size: 200,
        Cell: ({ row }) => (
          <Text size="sm" lineClamp={1}>
            {formatDate(row.original.createdDate, {
              month: "long",
              day: "2-digit",
              year: "numeric",
            })}
            <b>{` (${dateDiff({
              date: row.original.createdDate,
            })})`}</b>
          </Text>
        ),
      },
      {
        accessorKey: "tags",
        header: "Tags",
        size: 100,
        enableColumnFilter: false,
        accessorFn: (loan) => {
          return loan.tags.map((tag) => (
            <Badge key={tag.id} color={tag.color} variant="filled" size="xs">
              {tag.name}
            </Badge>
          ));
        },
      },
    ],
    []
  );

  return (
    <TableView
      data={data}
      columns={columns}
      totalCount={totalCount}
      columnOrder={["id", "status", "person", "items", "createdDate", "tags"]}
      renderRowActions={(loan) => (
        <Group w="100%">
          {loan.row.original._count.items > 0 && (
            <Tooltip label="Sign-In Items">
              <ActionIcon
                variant="subtle"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/loans/${loan.row.id}/signin`);
                }}
              >
                <IconClipboardCheck />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      )}
      onColumnFilterChange={(filters) => {
        setSearchParams(
          (prev) => {
            columns.forEach((column) => {
              prev.delete(column.id ?? "");
            });

            filters.forEach((filter) => {
              const value = String(filter.value).trim().toLowerCase();
              prev.set(filter.id, value);
            });

            return prev;
          },
          { replace: true }
        );
      }}
      onGlobalFilterChange={(filter) => {
        setSearchParams(
          (prev) => {
            if (!filter || filter === "") {
              prev.delete("q");
            } else {
              prev.set("q", filter);
            }

            return prev;
          },
          { replace: true }
        );
      }}
      columnFilters={[
        {
          id: "status",
          value: searchParams.get("status") ?? "",
        },
        {
          id: "person",
          value: searchParams.get("person") ?? "",
        },
        {
          id: "items",
          value: searchParams.get("items") ?? "",
        },
      ]}
      renderTopToolbarCustomActions={() => {
        const viewingOutstanding = searchParams.get("status") === "outstanding";

        return viewingOutstanding ? (
          <Button
            onClick={() =>
              setSearchParams((prev) => {
                prev.delete("status");
                return prev;
              })
            }
          >
            View All
          </Button>
        ) : (
          <Button
            onClick={() =>
              setSearchParams((prev) => {
                prev.set("status", "outstanding");
                return prev;
              })
            }
          >
            View Outstanding
          </Button>
        );
      }}
      onRowClick={(loan) => {
        navigate(`/loans/${loan.id}`);
      }}
    />
  );
}
