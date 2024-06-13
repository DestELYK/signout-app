import { Center, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import ItemList from "~/components/items/ItemList";
import ItemTable from "~/components/tables/ItemTable";
import { getItems } from "~/lib/items.server";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  const query = searchParams.get("q");
  const limit = searchParams.get("limit");
  const page = searchParams.get("page");

  const status = searchParams.get("status");
  const name = searchParams.get("name");

  const types = searchParams.get("type");
  const type = types ? types.split(",") : undefined;

  const itemStatuses =
    (await prisma.tag.findMany({
      where: {
        category: "Item Status",
      },
    })) ?? [];

  return typedjson({
    ...(await getItems(
      {
        query: query ?? undefined,
        name: name ?? undefined,
        status: status ?? undefined,
        types: type ?? undefined,
      },
      limit ? Number(limit) : undefined,
      page && limit ? Number(page) * Number(limit) : undefined
    )),
    statuses: [
      "Outstanding",
      "Available",
      ...itemStatuses.map((tag) => tag.name),
    ],
    types: await prisma.tag.findMany({
      where: {
        category: "Item Type",
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
    <ItemTable
      data={data?.items}
      totalCount={data?.totalCount}
      statuses={data.statuses}
      types={data.types}
    />
  ) : (
    <ItemList items={data?.items} totalCount={data?.totalCount} />
  );
}
