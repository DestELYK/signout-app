/**
 * People listing route with filtering and management capabilities
 *
 * This route provides people management functionality including:
 * - search and filtering by multiple criteria
 * - Paginated people display with configurable page sizes
 * - Bulk operations for people management (delete, update)
 * - Role-based filtering and outstanding loan tracking
 * - Responsive table/list view switching
 *
 * @requires PeopleList component for mobile view
 * @requires PersonTable component for desktop management
 * @requires Role and tag integration for filtering
 *
 * @module routes/people/list
 *
 * @author Kyle Dunn
 */

import { Alert, Box, Center, Loader } from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { IconAlertCircle } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { ClientOnly } from "remix-utils/client-only";
import PeopleList from "~/components/people/PeopleList";
import PersonTable from "~/components/tables/PersonTable";
import { useDesktopOnly } from "~/lib/hooks";
import { deletePeople, getPeople, getPersonRoles, updatePeople } from "~/lib/people.server";
import { getTags } from "~/lib/tags.server";
import { INITIAL_PAGE_SIZE, MAX_PAGE_SIZE } from "~/utils/consts";
import { parseNumber } from "~/utils/utils";

/**
 * Server-side loader function for people listing
 * Fetches paginated people with comprehensive filtering and related data
 *
 * @param request - The incoming request with search parameters
 * @returns JSON response with people data, roles, and tags
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  // Parse page size with bounds checking
  const pageSize = parseNumber(
    searchParams.get("limit"),
    INITIAL_PAGE_SIZE,
    undefined,
    MAX_PAGE_SIZE
  );

  // Execute main query and metadata queries in parallel for better performance
  const [peopleResult, roles, tags] = await Promise.all([
    // Fetch people with comprehensive filtering parameters
    getPeople(
      {
        query: searchParams.get("q") || undefined,
        firstName: searchParams.get("firstName") || undefined,
        lastName: searchParams.get("lastName") || undefined,
        nickname: searchParams.get("nickname") || undefined,
        roles: searchParams.getAll("role") || undefined,
        outstanding: searchParams.has("outstanding")
          ? searchParams.get("outstanding") === "true"
          : undefined,
        schoolId: searchParams.get("schoolId") || searchParams.get("qrCode") || undefined,
        tags: searchParams.getAll("tag") || undefined,
        sortBy: searchParams.get("sortBy") || undefined,
        order: searchParams.get("order") || undefined,
      },
      pageSize,
      parseNumber(searchParams.get("page"), 0) * pageSize
    ),

    // Fetch supporting data for filters
    getPersonRoles(),
    getTags({
      sortBy: searchParams.get("tagSortBy") || undefined,
      order: searchParams.get("tagOrder") || undefined,
    } as any),
  ]);

  // Check for errors in the main query result
  if (peopleResult.error) {
    return typedjson({
      data: [],
      totalCount: 0,
      roles: roles.data ?? [],
      tags: tags.tags ?? [],
      error: peopleResult.error,
    });
  }

  return typedjson({
    ...peopleResult,
    roles: roles.data,
    tags: tags.tags,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "PATCH":
      return typedjson(await updatePeople(await request.json()));
    case "DELETE":
      return typedjson(await deletePeople(await request.json()));
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
};

export default function Page() {
  const desktopOnly = useDesktopOnly();
  const peopleData = useTypedLoaderData<typeof loader>();

  return (
    <ClientOnly
      fallback={
        <Center w="100%" h="100%">
          <Loader />
        </Center>
      }
    >
      {() => (
        <Box pos="relative" w="100%" h="100%" p="sm">
          {peopleData.error ? (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error Loading People"
              color="red"
              variant="light"
              mb="md"
            >
              {peopleData.error}
            </Alert>
          ) : null}

          {desktopOnly ? (
            <PersonTable
              data={peopleData?.data}
              totalCount={peopleData?.totalCount}
              roles={peopleData.roles ?? []}
              tags={peopleData.tags ?? []}
            />
          ) : (
            <PeopleList data={peopleData?.data} totalCount={peopleData?.totalCount} />
          )}
        </Box>
      )}
    </ClientOnly>
  );
}
