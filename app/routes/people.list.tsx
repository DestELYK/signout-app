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

import { Box, Center, Loader } from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
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

  // Fetch supporting data for filters
  const roles = await getPersonRoles();
  const tags = await getTags({});

  return typedjson({
    // Fetch people with comprehensive filtering parameters
    ...(await getPeople(
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
      },
      pageSize,
      parseNumber(searchParams.get("page"), 0) * pageSize
    )),
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

  return desktopOnly === undefined ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : (
    <Box pos="relative" w="100%" h="100%" p="sm">
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
  );
}
