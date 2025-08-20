/**
 * Loans listing route with filtering and table management
 *
 * This route provides loan listing functionality with:
 * - search and filtering capabilities
 * - Paginated loan display with configurable page sizes
 * - Bulk operations for loan management
 * - Responsive table/list view switching
 * - Tag-based filtering and status filtering
 *
 * @requires LoanList component for mobile view
 * @requires LoanTable component for desktop management
 * @requires loan filtering and search
 *
 * @module routes/loans/list
 *
 * @author Kyle Dunn
 */

import { Box, Center, Loader } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { LoanList } from "~/components/loans/LoanList";
import LoanTable from "~/components/tables/LoanTable";
import { useDesktopOnly } from "~/lib/hooks";
import { deleteLoans, getLoans } from "~/lib/loans.server";
import { getTags } from "~/lib/tags.server";
import { INITIAL_PAGE_SIZE, MAX_PAGE_SIZE } from "~/utils/consts";
import { parseNumber } from "~/utils/utils";

import { ActionFunctionArgs } from "@remix-run/node";

/**
 * Server-side loader function for loans listing
 * Fetches paginated loans with comprehensive filtering options
 *
 * @param request - The incoming request with search parameters
 * @returns JSON response with loans data and available tags
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

  // Fetch available tags for filtering
  const tags = await getTags({});

  return typedjson({
    // Fetch loans with comprehensive filtering parameters
    ...(await getLoans(
      {
        query: searchParams.get("query") || searchParams.get("q") || undefined,
        statuses: searchParams.getAll("status") || undefined,
        personId: searchParams.get("personId") || undefined,
        itemIds: searchParams.getAll("itemId") || undefined,
        schoolId: searchParams.get("schoolId") || undefined,
        items: searchParams.get("items") || undefined,
        person: searchParams.get("person") || undefined,
        tags: searchParams.getAll("tag") || undefined,
      },
      undefined,
      pageSize,
      parseNumber(searchParams.get("page"), 0) * pageSize
    )),
    tags: tags.tags,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "DELETE":
      return typedjson(await deleteLoans(await request.json()));
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
};

export default function Page() {
  const desktopOnly = useDesktopOnly();
  const loanData = useTypedLoaderData<typeof loader>();

  return desktopOnly === undefined ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : (
    <Box pos="relative" w="100%" h="100%" p="sm">
      {desktopOnly ? (
        <LoanTable
          data={loanData?.data}
          totalCount={loanData?.totalCount}
          tags={loanData.tags ?? []}
        />
      ) : (
        <LoanList data={loanData?.data} totalCount={loanData?.totalCount} />
      )}
    </Box>
  );
}
