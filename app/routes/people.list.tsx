import { Center, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import PeopleList from "~/components/people/PeopleList";
import PersonTable from "~/components/tables/PersonTable";
import { getPeople } from "~/lib/people.server";
import { prisma } from "~/lib/prisma.server";
import { INITIAL_PAGE_SIZE, MAX_PAGE_SIZE } from "~/utils/consts";
import { parseNumber } from "~/utils/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  const query = searchParams.get("q");
  const limit = searchParams.get("limit");
  const page = searchParams.get("page");

  const firstName = searchParams.get("firstName");
  const lastName = searchParams.get("lastName");
  const nickname = searchParams.get("nickname");

  const role = searchParams.get("role");
  const roles = role ? role.split(",") : undefined;

  const outstanding = searchParams.get("outstanding");

  const pageSize = parseNumber(
    limit,
    INITIAL_PAGE_SIZE,
    undefined,
    MAX_PAGE_SIZE
  );

  return typedjson({
    ...(await getPeople(
      {
        query: query ?? undefined,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        nickname: nickname ?? undefined,
        roles: roles ?? undefined,
        outstanding:
          outstanding === null
            ? undefined
            : outstanding.toLocaleLowerCase() === "true",
      },
      pageSize,
      parseNumber(page, 0) * pageSize
    )),
    roles: await prisma.tag.findMany({
      where: {
        category: "Person Role",
      },
    }),
  });
};

export default function Page() {
  const matches = useMediaQuery("(min-width: 62em)");
  const data = useTypedLoaderData<typeof loader>();

  return matches === undefined ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : matches ? (
    <PersonTable
      data={data?.people}
      totalCount={data?.totalCount}
      roles={data.roles}
    />
  ) : (
    <PeopleList people={data?.people} totalCount={data?.totalCount} />
  );
}
