import { Box, Center, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { LoanList } from "~/components/loans/LoanList";
import LoanTable from "~/components/tables/LoanTable";
import { getLoans } from "~/lib/loans.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  const query = searchParams.get("q");
  const limit = searchParams.get("limit");
  const page = searchParams.get("page");

  const status = searchParams.get("status");
  const person = searchParams.get("person");
  const items = searchParams.get("items");

  return typedjson(
    await getLoans(
      {
        query: query ?? undefined,
        status: status as "outstanding" | "returned" | undefined,
        person: person ?? undefined,
        items: items ?? undefined,
      },
      limit ? Number(limit) : undefined,
      page && limit ? Number(page) * Number(limit) : undefined
    )
  );
};

export default function Page() {
  const matches = useMediaQuery("(min-width: 62em)");
  const data = useTypedLoaderData<typeof loader>();

  return matches === undefined ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : matches ? (
    <Box w="100%" mb={4} visibleFrom="md">
      <LoanTable data={data?.loans} totalCount={data?.totalCount} />
    </Box>
  ) : (
    <Box w="100%" hiddenFrom="md">
      <LoanList loans={data?.loans} totalCount={data?.totalCount} />
    </Box>
  );
}
