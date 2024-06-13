import { ActionIcon, Badge, Button, Group, Text, Tooltip } from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { IconClipboardCheck } from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { LoanWithTagsAndItems } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import OutstandingBadge from "../OutstandingBadge";
import TableView from "../base/TableView";
import HighlightCell from "./HighlightCell";

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
        size: 120,
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: ["Outstanding", "Returned"],
          style: { minWidth: 120 },
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
        id: "person",
        header: "Person",
        size: 150,
        accessorFn: (loan) => {
          return formatFullName(loan.person);
        },
        Cell: ({ cell, table }) => <HighlightCell cell={cell} table={table} />,
      },
      {
        id: "items",
        header: "Items",
        size: 150,
        accessorFn: (loan) => {
          return loan.items.map((item) => item.item.name).join(", ");
        },
        Cell: ({ cell, table }) => <HighlightCell cell={cell} table={table} />,
      },
      {
        accessorKey: "createdDate",
        header: "Date",
        enableColumnFilter: false,
        mantineFilterDateInputProps: {},
        size: 200,
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
      columnFilters={[
        { id: "status", type: "string" },
        { id: "person", type: "string" },
        { id: "items", type: "array" },
      ]}
      handleColumnFilter={(id, value, type) => {
        if (id === "status") {
          return type === "get"
            ? upperFirst(value as string)
            : (value as string).toLocaleLowerCase();
        } else {
          return value;
        }
      }}
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
      renderTopToolbarCustomActions={() => {
        const viewingOutstanding =
          searchParams.get("status")?.toLocaleLowerCase() === "outstanding";

        return viewingOutstanding ? (
          <Button
            onClick={() =>
              setSearchParams(
                (prev) => {
                  prev.delete("status");
                  return prev;
                },
                { replace: true }
              )
            }
          >
            View All
          </Button>
        ) : (
          <Button
            onClick={() =>
              setSearchParams(
                (prev) => {
                  prev.set("status", "outstanding");
                  return prev;
                },
                { replace: true }
              )
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
