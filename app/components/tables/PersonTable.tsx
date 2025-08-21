/**
 * PersonTable Component
 *
 * A data table component for displaying and managing people
 * with filtering, role management, and bulk operations.
 * Built with Mantine React Table for -featured person management.
 *
 *
 * @module PersonTable
 *
 * @author Kyle Dunn
 */

import { Badge, Button, Divider, Group, Modal, Paper, Stack, Text } from "@mantine/core";
import { useField } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { PersonRole } from "@prisma/client";
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
import { useTypedFetcher } from "remix-typedjson";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { loader } from "~/routes/people.roles";
import { INITIAL_PAGE_SIZE } from "~/utils/consts";
import { DataReturn, PersonData, PersonRoleData, TagData } from "~/utils/types.server";
import FetcherField from "../base/FetcherField";
import ComboView from "../ComboView";
import PersonRoleForm from "../forms/PersonRoleForm";
import TagGroup from "../tags/TagGroup";
import HighlightCell from "./HighlightCell";

/**
 * Props for the PersonTable component
 */
export interface PersonTableProps {
  /** Array of person data to display in the table */
  data: PersonData[] | undefined;
  /** Total count of people for pagination */
  totalCount?: number;
  /** Available person roles for filtering and assignment */
  roles: PersonRoleData[];
  /** Available tags for filtering */
  tags: TagData[];
}

/**
 * A comprehensive data table for person management with role assignment
 * Provides filtering, sorting, selection, and bulk operations
 *
 * @param props - The component props
 * @returns The rendered person table component
 */
export default function PersonTable({ data, totalCount, roles, tags }: PersonTableProps) {
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const [personRole, setPersonRole] = useState<string>("");

  // Ensure data is always an array to prevent MRT errors
  const safeData = useMemo(() => data ?? [], [data]);

  const personRoleField = useField<PersonRoleData | undefined>({
    initialValue: undefined,
    validate: (value) => {
      if (!value) {
        return "Role is required";
      }
    },
  });

  const rolesFetcher = useTypedFetcher<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([
    {
      id: "schoolId",
      value: searchParams.get("schoolId") ?? "",
    },
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
      value: roles
        .filter(
          (role) =>
            searchParams.getAll("role").includes(role.id.toString()) ||
            searchParams.getAll("role").includes(role.name)
        )
        .map((role) => role.name),
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
  const [initialParamsProcessed, setInitialParamsProcessed] = useState(false);
  const [sorting, setSorting] = useState<MRT_SortingState>(() => {
    const sortByParams = searchParams.getAll("sortBy");
    const orderParams = searchParams.getAll("order");

    if (sortByParams.length > 0) {
      return sortByParams.map((sortBy, index) => ({
        id: sortBy,
        desc: (orderParams[index] || "desc") === "desc",
      }));
    }

    return [{ id: "id", desc: true }];
  });

  // const typeNames = types.map((type) => type.name);
  // const locationNames = locations.map((location) => location.name);
  const roleNames = roles.map((role) => role.name);
  const tagNames = tags.map((tag) => tag.name);

  const notificationId = "item-delete";

  // Mark initial params as processed on first render
  useEffect(() => {
    setInitialParamsProcessed(true);
  }, []);

  const peopleFetcher = useFetcherWithErrorHandler<DataReturn<number>>(
    (data) => {
      if (data.data !== undefined) {
        setRowSelection({});
        notifications.update({
          id: notificationId,
          message: `Updated ${data.data} items successfully`,
          loading: false,
          autoClose: 5000,
          withCloseButton: true,
        });
      }
    },
    (error) => {
      notifications.update({
        id: notificationId,
        message: `Failed to update items`,
        color: "red",
        loading: false,
        autoClose: 5000,
        withCloseButton: true,
      });
    }
  );

  const columns = useMemo<MRT_ColumnDef<PersonData>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableColumnFilter: false,
        size: 80,
      },
      {
        accessorKey: "schoolId",
        header: "School ID",
        accessorFn: (person) => person.schoolId ?? "None",
      },
      {
        accessorKey: "firstName",
        header: "First Name",
        Cell: ({ cell, table }) => <HighlightCell cell={cell} table={table} />,
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        Cell: ({ cell, table }) => <HighlightCell cell={cell} table={table} />,
      },
      {
        accessorKey: "nickname",
        header: "Nickname",
        accessorFn: (person) => person.nickname ?? "None",
        Cell: ({ cell, table }) => <HighlightCell cell={cell} table={table} />,
      },
      {
        accessorKey: "role",
        header: "Role",
        filterVariant: "multi-select",
        mantineFilterMultiSelectProps: {
          data: roleNames,
          placeholder: "Select Role",
        },
        accessorFn: (person) => {
          return person?.role;
        },
        Cell: ({ cell, renderedCellValue }) => {
          const role = cell.getValue<PersonRole>();

          if (role) {
            return (
              <Badge color={role.color} variant="dot" autoContrast>
                {role.name}
              </Badge>
            );
          }
          return null;
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
          return loan?.tags;
        },
        Cell: ({ cell, table }) => {
          const tags = cell.getValue<TagData[]>();
          return <TagGroup tags={tags || []} badgeProps={{ size: "xs" }} />;
        },
      },
      {
        accessorKey: "lostCount",
        header: "# of Problem Items",
        size: 120,
        enableColumnFilter: false,
        enableSorting: false,
        accessorFn: (person) => person?.lostItemsCount,
        Cell: ({ cell }) => {
          const lostItemsCount = cell.getValue<number>();

          return (
            <Text
              c={lostItemsCount > 0 ? "red" : undefined}
              fw={lostItemsCount > 0 ? "bold" : undefined}
            >
              {lostItemsCount}
            </Text>
          );
        },
      },
      {
        accessorKey: "loanCount",
        header: "# of Loans",
        size: 100,
        enableColumnFilter: false,
        enableSorting: false,
        accessorFn: (person) => person?.loansCount,
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns: columns,
    data: safeData,
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
    rowCount: totalCount ?? 0,
    initialState: {
      showGlobalFilter: true,
      showColumnFilters: true,
    },
    state: {
      isLoading: data === undefined || !initialParamsProcessed,
      columnFilters: columnFilters,
      globalFilter: globalFilter,
      pagination: pagination,
      rowSelection: rowSelection,
      sorting: sorting,
    },
    positionToolbarAlertBanner: "bottom",
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: (value) => {
      if (!value || value.length === 0) {
        return;
      }

      setColumnFilters(value);
    },
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value || "");
    },
    onPaginationChange: setPagination,
    getRowId: (row: PersonData) => row?.id?.toString() ?? "",
    mantineTableBodyRowProps: (row) => ({
      onClick: () => row?.row?.original?.id && navigate(`/people/${row.row.original.id}`),
      style: {
        cursor: "pointer",
        fontSize: "xs",
      },
    }),
    renderTopToolbarCustomActions: ({ table }) => {
      const selection = Object.entries(rowSelection);
      const hasSelection = selection.length > 0;

      return (
        <Group>
          <Button disabled={!hasSelection} variant="outline" onClick={open}>
            Update Role
          </Button>
          <Button
            disabled={!hasSelection}
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
                  peopleFetcher.submit(
                    { peopleIds: selection.map(([id]) => id) },
                    {
                      action: "/people/list",
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
        </Group>
      );
    },
  });

  useEffect(() => {
    // Prevent clearing URL params on initial load if filters are being initialized
    const hasInitialFilters = columnFilters.some(
      (f) =>
        (Array.isArray(f.value) && f.value.length > 0) ||
        (typeof f.value === "string" && f.value.length > 0)
    );

    // Only update URL if we have active filters or need to clear them
    if (
      hasInitialFilters ||
      globalFilter ||
      pagination.pageIndex > 0 ||
      pagination.pageSize !== INITIAL_PAGE_SIZE ||
      sorting.length > 0
    ) {
      // Create new URLSearchParams to compare with current
      const newSearchParams = new URLSearchParams(searchParams);

      const mappedFilters = columnFilters.map((filter) => ({
        [filter.id]: filter.value,
      }));

      // Clear existing params that might be updated
      !("q" in mappedFilters) && newSearchParams.delete("q");
      !("page" in mappedFilters) && newSearchParams.delete("page");
      !("limit" in mappedFilters) && newSearchParams.delete("limit");
      !("schoolId" in mappedFilters) && newSearchParams.delete("schoolId");
      !("firstName" in mappedFilters) && newSearchParams.delete("firstName");
      !("lastName" in mappedFilters) && newSearchParams.delete("lastName");
      !("nickname" in mappedFilters) && newSearchParams.delete("nickname");
      !("role" in mappedFilters) && newSearchParams.delete("role");
      !("tag" in mappedFilters) && newSearchParams.delete("tag");
      newSearchParams.delete("sortBy");
      newSearchParams.delete("order");

      columnFilters
        .filter((f) =>
          globalFilter && globalFilter.length > 0 ? f.id !== "person" && f.id !== "items" : true
        )
        .forEach((filter) => {
          if (typeof filter.value === "string" && filter.value.length > 0) {
            switch (filter.id) {
              default:
                newSearchParams.set(filter.id, filter.value);
                break;
            }
          } else if (Array.isArray(filter.value)) {
            filter.value.forEach((val: any) => {
              if (typeof val === "string" && val.length > 0) {
                switch (filter.id) {
                  case "role":
                    const role = roles.find((role) => role.name === val);
                    if (role) {
                      newSearchParams.append("role", role.id.toString());
                    }
                    break;
                  case "tags":
                    const tag = tags.find((tag) => tag.name === val);
                    if (tag) {
                      newSearchParams.append("tag", tag.id.toString());
                    }
                    break;
                  default:
                    newSearchParams.append(filter.id, val);
                    break;
                }
              }
            });
          }
        });
      if (globalFilter) {
        newSearchParams.set("q", globalFilter);
      } else {
        newSearchParams.delete("q");
      }
      if (pagination.pageIndex > 0) {
        newSearchParams.set("page", pagination.pageIndex.toString());
      }
      if (pagination.pageSize !== INITIAL_PAGE_SIZE) {
        newSearchParams.set("limit", pagination.pageSize.toString());
      }

      // Add sorting parameters
      if (sorting.length > 0) {
        sorting.forEach((sort) => {
          newSearchParams.append("sortBy", sort.id);
          newSearchParams.append("order", sort.desc ? "desc" : "asc");
        });
      }

      // Only update if there are actual differences
      if (newSearchParams.toString() !== searchParams.toString()) {
        setSearchParams(newSearchParams, { replace: true });
      }
    }
  }, [columnFilters, globalFilter, pagination, sorting, searchParams, roles, tags]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => {
          setPersonRole("");
          personRoleField.setValue(undefined);

          close();
        }}
        title="Update Role"
        centered
      >
        <Stack>
          <FetcherField
            label="Role"
            description="Select the person's role"
            placeholder="Search for role..."
            fetchPath="/people/roles"
            createTitle="Create New Role"
            fetcher={rolesFetcher}
            required
            value={personRole}
            onBlur={() => {
              personRoleField.validate();
              setPersonRole(personRoleField.getValue()?.name ?? "");

              return true;
            }}
            onFocus={() => {
              personRoleField.setError(undefined);

              return true;
            }}
            onChange={(value) => {
              setPersonRole(value);

              return true;
            }}
            onClear={() => {
              setPersonRole("");
              personRoleField.setValue(undefined);
            }}
            error={personRoleField.error}
            onFetched={(fetchData) => fetchData?.data ?? []}
            withQRCode={false}
            onSelect={(id, value) => {
              if (value) {
                setPersonRole(value.name);
                personRoleField.setValue(value);
                personRoleField.validate();

                return true;
              }
            }}
            handleCreateForm={(close) => {
              return (
                <PersonRoleForm
                  initialValues={{
                    name: personRole,
                    description: "",
                    color: "#000000",
                  }}
                  onResult={(result) => {
                    if (result.data) {
                      personRoleField.setValue(result.data);
                      close();
                    }
                  }}
                />
              );
            }}
          >
            {(value, query) => (
              <ComboView title={value.name} caption={value.description} highlight={query ?? ""} />
            )}
          </FetcherField>
          {personRoleField.getValue() !== undefined && (
            <>
              <Paper withBorder p="xs">
                <Text c="red" ta="center">
                  The following changes will be made below:
                </Text>
                <Divider my="xs" />
                {Object.entries(rowSelection).map(([id, selected]) => {
                  const person = data?.find((person) => person.id === parseInt(id));

                  return (
                    <Group key={id} justify="space-between">
                      <Text
                        fw="bold"
                        ta="center"
                      >{`${person?.firstName} ${person?.lastName}`}</Text>
                      <Text ta="center">
                        {person?.role?.name} to {personRoleField.getValue()?.name}
                      </Text>
                    </Group>
                  );
                })}
              </Paper>
              <Text c="red" ta="center">
                Warning: This action cannot be undone!
              </Text>
            </>
          )}
          <Divider />
          <Group justify="end">
            <Button onClick={close} color="gray" variant="outline">
              Cancel
            </Button>
            <Button
              disabled={personRoleField.error !== undefined}
              onClick={() => {
                const selection = Object.entries(rowSelection);
                notifications.show({
                  id: notificationId,
                  message: `Applying new roles to ${selection.length} people...`,
                  loading: true,
                  autoClose: false,
                  withCloseButton: false,
                });
                peopleFetcher.submit(
                  JSON.stringify({
                    peopleIds: selection.map(([id]) => id),
                    roleId: personRoleField.getValue()?.id,
                  }),
                  {
                    action: "/people/list",
                    method: "PATCH",
                    encType: "application/json",
                  }
                );
                close();
              }}
            >
              Update Role
            </Button>
          </Group>
        </Stack>
      </Modal>

      <MantineReactTable table={table} />
    </>
  );
}
