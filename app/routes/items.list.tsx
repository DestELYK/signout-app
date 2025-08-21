/**
 * Items listing route with filtering and table management
 *
 * This route provides item management functionality including:
 * - search and filtering capabilities
 * - Paginated item display with configurable page sizes
 * - Bulk operations for item management
 * - Responsive table/list view switching
 * - Multi-parameter filtering (status, type, location, person)
 *
 * @requires ItemList component for mobile view
 * @requires ItemTable component for desktop management
 * @requires item filtering and search
 *
 * @module routes/items/list
 *
 * @author Kyle Dunn
 */

import { Alert, Box, Center, Loader } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { IconAlertCircle } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { ClientOnly } from "remix-utils/client-only";
import ItemList from "~/components/items/ItemList";
import ItemTable from "~/components/tables/ItemTable";
import { handleError } from "~/lib/db.server";
import { useDesktopOnly } from "~/lib/hooks";
import { deleteItems, getItemLocations, getItems, getItemTypes } from "~/lib/items.server";
import { getTags } from "~/lib/tags.server";
import { INITIAL_PAGE_SIZE, MAX_PAGE_SIZE, STATUS_OPTIONS } from "~/utils/consts";
import { parseNumber } from "~/utils/utils";

import { ActionFunctionArgs } from "@remix-run/node";

/**
 * Server-side loader function for items listing
 * Fetches paginated items with comprehensive filtering and related data
 *
 * @param request - The incoming request with search parameters
 * @returns JSON response with items data, types, locations, and tags
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  try {
    // Parse pagination parameters with bounds checking
    const pageSize = parseNumber(
      searchParams.get("limit"),
      INITIAL_PAGE_SIZE,
      undefined,
      MAX_PAGE_SIZE
    );

    const offset = parseNumber(searchParams.get("page"), 0);

    // Execute main query and metadata queries in parallel for better performance
    const [itemResult, itemTypes, itemLocations, tags] = await Promise.all([
      // Fetch items with comprehensive filtering parameters
      getItems(
        {
          query: searchParams.get("query") || searchParams.get("q") || undefined,
          name: searchParams.get("name") || undefined,
          statuses: searchParams.getAll("status") ?? undefined,
          types: searchParams.getAll("type"),
          locations: searchParams.getAll("location"),
          sortBy: searchParams.get("sortBy") || undefined,
          order: searchParams.get("order") || undefined,
          personId: searchParams.get("personId") || undefined,
          tags: searchParams.getAll("tag") || undefined,
        },
        pageSize,
        parseNumber(searchParams.get("page"), 0) * pageSize
      ),

      // Fetch metadata for filters
      getItemTypes(),
      getItemLocations(),
      getTags({
        sortBy: searchParams.get("tagSortBy") || undefined,
        order: searchParams.get("tagOrder") || undefined,
      } as any),
    ]);

    return typedjson({
      items: itemResult.data,
      totalCount: itemResult.totalCount,
      error: itemResult.error,
      statuses: STATUS_OPTIONS,
      itemTypes: itemTypes.data,
      itemLocations: itemLocations.data,
      tags: tags,
    });
  } catch (error) {
    return typedjson({
      items: undefined,
      totalCount: undefined,
      statuses: undefined,
      itemTypes: undefined,
      itemLocations: undefined,
      tags: undefined,
      error: handleError(error),
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "DELETE":
      return typedjson(await deleteItems(await request.json()));
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
};

export default function Page() {
  const desktopOnly = useDesktopOnly();
  const data = useTypedLoaderData<typeof loader>();

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
          {data.error ? (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error Loading Items"
              color="red"
              variant="light"
              mb="md"
            >
              {data.error}
            </Alert>
          ) : null}

          {desktopOnly ? (
            <ItemTable
              data={data.items}
              totalCount={data.totalCount}
              statuses={data.statuses ?? []}
              types={data.itemTypes ?? []}
              locations={data.itemLocations ?? []}
              tags={data.tags?.tags ?? []}
            />
          ) : (
            <ItemList data={data?.items} totalCount={data?.totalCount} />
          )}
        </Box>
      )}
    </ClientOnly>
  );
}
