import { Badge, Text } from "@mantine/core";
import { Tag } from "@prisma/client";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { ItemWithTags } from "~/utils/types.server";
import { dateDiff, formatDate } from "~/utils/utils";
import { createOutstandingTag } from "../OutstandingBadge";
import TableView from "../base/TableView";

export interface ItemTableProps {
  data: ItemWithTags[] | undefined;
  totalCount?: number;
  statuses: string[];
  types: Tag[];
}

export default function ItemTable({
  data,
  totalCount,
  statuses,
  types,
}: ItemTableProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const typeNames = types.map((type) => type.name);

  const columns = useMemo<MRT_ColumnDef<ItemWithTags>[]>(
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
          data: statuses,
        },
        accessorFn: (item) => {
          const itemStatus = item.tags.find(
            (tag) => tag.category === "Item Status"
          );

          if (item._count.loans > 0 && itemStatus) {
            return itemStatus;
          } else {
            return createOutstandingTag({
              out: item._count.loans > 0,
              inLabel: "Available",
              outLabel: "Outstanding",
            });
          }
        },
        Cell: ({ cell }) => {
          const tag = cell.getValue<Tag>();
          return <Badge color={tag.color}>{tag.name}</Badge>;
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 150,
        filterFn: (row, query) => row.original.name.includes(query),
        Cell: ({ row, renderedCellValue }) => (
          <Text lineClamp={1} size="sm">
            {renderedCellValue}
          </Text>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        size: 100,
        filterVariant: "multi-select",
        mantineFilterMultiSelectProps: {
          data: typeNames,
        },
        accessorFn: (item) => {
          return item.tags.filter((tag) => tag.category === "Item Type");
        },
        Cell: ({ cell }) => {
          const tags = cell.getValue<Tag[]>();

          return tags.map((tag) => (
            <Badge key={tag.id} color={tag.color} size="xs">
              {tag.name}
            </Badge>
          ));
        },
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
        accessorKey: "location",
        header: "Location",
        size: 100,
        enableColumnFilter: false,
        accessorFn: (item) => {
          return item.tags.filter((tag) => tag.id === item.locationId);
        },
        Cell: ({ cell }) => {
          const tags = cell.getValue<Tag[]>();

          return tags.map((tag) => (
            <Badge key={tag.id} color={tag.color} size="xs">
              {tag.name}
            </Badge>
          ));
        },
      },
      {
        accessorKey: "tags",
        header: "Tags",
        size: 100,
        enableColumnFilter: false,
        accessorFn: (loan) => {
          return loan.tags.filter(
            (tag) =>
              tag.category !== "Item Type" &&
              tag.category !== "Location" &&
              tag.category !== "Item Status"
          );
        },
        Cell: ({ cell }) => {
          return cell.getValue<Tag[]>().map((tag) => (
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
      columnOrder={["id", "status", "name", "type", "createdDate", "tags"]}
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
          id: "name",
          value: searchParams.get("name") ?? "",
        },
        {
          id: "type",
          value: searchParams.get("type") ?? "",
        },
      ]}
      onRowClick={(item) => {
        navigate(`/items/${item.id}`);
      }}
    />
  );
}
