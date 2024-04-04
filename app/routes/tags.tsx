import { Prisma } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const category = url.searchParams.get("category");
  const query = url.searchParams.get("q") || url.searchParams.get("query");

  let filter: Prisma.TagWhereInput = {};

  try {
    filter = {
      ...(category && { category: category }),
      ...(query && {
        name: {
          contains: query,
        },
      }),
    };
  } catch (e) {
    console.error("Failed to create filter", e);
  }

  const tags = await prisma.tag.findMany({
    where: filter,
  });

  console.log(
    "Found %i tags with filter %s",
    tags.length,
    JSON.stringify(filter)
  );

  return typedjson(tags);
};
