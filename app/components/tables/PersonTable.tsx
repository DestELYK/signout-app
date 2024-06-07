import { Badge, Box, Text } from "@mantine/core";
import { Tag } from "@prisma/client";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { PersonWithTags } from "~/utils/types.server";
import { dateDiff, formatDate } from "~/utils/utils";
import TableView from "../base/TableView";

export interface PersonTableProps {
  data: PersonWithTags[] | undefined;
  totalCount?: number;
  roles: Tag[];
}

export default function PersonTable({
  data,
  totalCount,
  roles,
}: PersonTableProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const roleNames = roles.map((role) => role.name);

  const columns = useMemo<MRT_ColumnDef<PersonWithTags>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableColumnFilter: false,
        size: 5,
      },
      {
        accessorKey: "firstName",
        header: "First Name",
        size: 80,
        filterFn: (row, query) => row.original.firstName.includes(query),
        Cell: ({ row, renderedCellValue }) => (
          <Text lineClamp={1} size="sm">
            {renderedCellValue}
          </Text>
        ),
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        size: 80,
        filterFn: (row, query) => row.original.lastName.includes(query),
        Cell: ({ row, renderedCellValue }) => (
          <Text lineClamp={1} size="sm">
            {renderedCellValue}
          </Text>
        ),
      },
      {
        accessorKey: "nickname",
        header: "Nickname",
        size: 80,
        filterFn: (row, query) =>
          row.original.nickname?.includes(query) ?? false,
        accessorFn: (person) => person.nickname ?? "None",
        Cell: ({ row, renderedCellValue }) => (
          <Text
            lineClamp={1}
            size="sm"
            {...(!row.original.nickname && { c: "dimmed" })}
          >
            {renderedCellValue}
          </Text>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 100,
        filterVariant: "multi-select",
        mantineFilterSelectProps: {
          data: roleNames,
          placeholder: "Select Role",
        },
        filterFn: (row, query) => row.original.firstName.includes(query),
        accessorFn: (person) => {
          return person.tags.find((tag) => tag.category === "Person Role");
        },
        Cell: ({ cell, renderedCellValue }) => {
          const role = cell.getValue<Tag>();

          return <Badge color={role.color}>{role.name}</Badge>;
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
        accessorKey: "tags",
        header: "Tags",
        size: 100,
        enableColumnFilter: false,
        accessorFn: (loan) => {
          return loan.tags.filter((tag) => tag.category !== "Person Role");
        },
        Cell: ({ cell, renderedCellValue }) => (
          <Box>
            {cell.getValue<Tag[]>().map((tag) => (
              <Badge key={tag.id} color={tag.color}>
                {tag.name}
              </Badge>
            ))}
          </Box>
        ),
      },
      {
        accessorKey: "loanCount",
        header: "# of Loans",
        size: 10,
        enableColumnFilter: false,
        accessorFn: (person) => person.loans.length,
      },
    ],
    []
  );

  return (
    <TableView
      data={data}
      columns={columns}
      totalCount={totalCount}
      columnOrder={[
        "id",
        "firstName",
        "lastName",
        "nickname",
        "role",
        "createdDate",
        "tags",
      ]}
      onColumnFilterChange={(filters) => {
        setSearchParams(
          (prev) => {
            columns.forEach((column) => {
              prev.delete(column.id ?? "");
            });

            filters.forEach((filter) => {
              const value = String(filter.value).trim().toLowerCase();
              if (value !== "") {
                prev.set(filter.id, value);
              }
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
          id: "firstName",
          value: searchParams.get("firstName") ?? "",
        },
        {
          id: "lastName",
          value: searchParams.get("lastName") ?? "",
        },
        {
          id: "nickname",
          value: searchParams.get("nickname") ?? "",
        },
        {
          id: "role",
          value: searchParams.get("role") ?? "",
        },
      ]}
      onRowClick={(person) => {
        navigate(`/people/${person.id}`);
      }}
    />
  );
}
