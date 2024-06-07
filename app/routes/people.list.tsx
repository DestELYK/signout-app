import { Box, Center, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import PeopleList from "~/components/people/PeopleList";
import PersonTable from "~/components/tables/PersonTable";
import { getPeople } from "~/lib/people.server";
import { prisma } from "~/lib/prisma.server";

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

  return typedjson({
    ...(await getPeople(
      {
        query: query ?? undefined,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        nickname: nickname ?? undefined,
        roles: roles ?? undefined,
        outstanding: outstanding === null ? undefined : outstanding === "true",
      },
      limit ? Number(limit) : undefined,
      page && limit ? Number(page) * Number(limit) : undefined
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
    <Box w="100%" mb={4} visibleFrom="md">
      <PersonTable
        data={data?.people}
        totalCount={data?.totalCount}
        roles={data.roles}
      />
    </Box>
  ) : (
    <Box w="100%" hiddenFrom="md">
      <PeopleList people={data?.people} totalCount={data?.totalCount} />
    </Box>
  );
}
