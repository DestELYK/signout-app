import { Badge, Box, Text } from "@mantine/core";
import { PersonRole, Tag } from "@prisma/client";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { PersonWithTags } from "~/utils/types.server";
import { dateDiff, formatDate } from "~/utils/utils";
import TableView from "../base/TableView";
import HighlightCell from "./HighlightCell";

export interface PersonTableProps {
    data: PersonWithTags[] | undefined;
    totalCount?: number;
    roles: PersonRole[];
}

export default function PersonTable({ data, totalCount, roles }: PersonTableProps) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const roleNames = roles.map((role) => role.name);

    const columns = useMemo<MRT_ColumnDef<PersonWithTags>[]>(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                enableColumnFilter: false,
                size: 100,
                mantineTableBodyCellProps: {
                    style: { minWidth: 100, maxWidth: 100 },
                },
            },
            {
                accessorKey: "studentId",
                header: "Student ID",
                size: 100,
                mantineFilterTextInputProps: {
                    style: { minWidth: 100, maxWidth: 100 },
                },
            },
            {
                accessorKey: "firstName",
                header: "First Name",
                size: 150,
                mantineFilterTextInputProps: {
                    style: { minWidth: 150 },
                },
                Cell: ({ cell, table }) => <HighlightCell cell={cell} table={table} />,
            },
            {
                accessorKey: "lastName",
                header: "Last Name",
                size: 150,
                mantineFilterTextInputProps: {
                    style: { minWidth: 150 },
                },
                Cell: ({ cell, table }) => <HighlightCell cell={cell} table={table} />,
            },
            {
                accessorKey: "nickname",
                header: "Nickname",
                size: 150,
                mantineFilterTextInputProps: {
                    style: { minWidth: 150 },
                },
                accessorFn: (person) => person.nickname ?? "None",
                Cell: ({ cell, table }) => <HighlightCell cell={cell} table={table} />,
            },
            {
                accessorKey: "role",
                header: "Role",
                size: 100,
                filterVariant: "multi-select",
                mantineFilterMultiSelectProps: {
                    data: roleNames,
                    placeholder: "Select Role",
                    style: { minWidth: 100, maxWidth: 150 },
                },
                accessorFn: (person) => {
                    return person.role;
                },
                Cell: ({ cell, renderedCellValue }) => {
                    const role = cell.getValue<PersonRole>();

                    return (
                        <Badge color={role.color} variant="dot" autoContrast>
                            {role.name}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "createdDate",
                header: "Date",
                enableColumnFilter: false,
                mantineFilterDateInputProps: {},
                size: 200,
                Cell: ({ row }) => (
                    <Text size="sm" lineClamp={2}>
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
                "studentId",
                "firstName",
                "lastName",
                "nickname",
                "role",
                "createdDate",
                "tags",
            ]}
            columnFilters={[
                { id: "firstName", type: "string" },
                { id: "lastName", type: "string" },
                { id: "nickname", type: "string" },
                { id: "role", type: "array" },
            ]}
            onRowClick={(person) => {
                navigate(`/people/${person.id}`);
            }}
        />
    );
}
