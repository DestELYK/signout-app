import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.json();

  try {
    switch (request.method) {
      case "POST":
        const name = formData.name;

        if (!name) {
          throw new Error("Name must be provided");
        }

        const color = formData.color;

        // TODO - color validation
        if (!color) {
          throw new Error("Color must be provided");
        }

        const category = formData.category;

        if (!category) {
          throw new Error("Category must be provided");
        }

        return typedjson(
          await prisma.tag.create({
            data: {
              name: name,
              color: color,
              category: category
            },
          })
        );
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    console.error(e);
    throw new Response(null, {
      status: 500,
    });
  }
}
