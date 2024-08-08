import { Center, Loader } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { LoanList } from "~/components/loans/LoanList";
import LoanTable from "~/components/tables/LoanTable";
import { useDesktopOnly } from "~/lib/hooks";
import { getLoans } from "~/lib/loans.server";
import { INITIAL_PAGE_SIZE, MAX_PAGE_SIZE } from "~/utils/consts";
import { parseNumber } from "~/utils/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  const query = searchParams.get("q");
  const limit = searchParams.get("limit");
  const page = searchParams.get("page");

  const status = searchParams.get("status");
  const person = searchParams.get("person");
  const personId = searchParams.get("personId");
  const items = searchParams.get("items");

  const pageSize = parseNumber(limit, INITIAL_PAGE_SIZE, undefined, MAX_PAGE_SIZE);

  return typedjson(
      await getLoans(
          {
              query: query ?? undefined,
              status: status as "outstanding" | "returned" | undefined,
              person: person ?? undefined,
              personId: parseNumber(personId, undefined, 0),
              items: items ?? undefined,
          },
          pageSize,
          parseNumber(page, 0) * pageSize
      )
  );
};

export default function Page() {
  const desktopOnly = useDesktopOnly();
  const data = useTypedLoaderData<typeof loader>();

  return desktopOnly === undefined ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : desktopOnly ? (
    <LoanTable data={data?.loans} totalCount={data?.totalCount} />
  ) : (
    <LoanList data={data?.loans} totalCount={data?.totalCount} />
  );
}
