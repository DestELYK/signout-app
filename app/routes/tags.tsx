import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import { handleError } from "~/lib/db.server";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const category = url.searchParams.get("category");
  const query = url.searchParams.get("q") || url.searchParams.get("query");

  try {
    const tags = await prisma.tag.findMany({
      where: {
        ...(category && { category: category }),
        ...(query && {
          name: {
            contains: query,
          },
        }),
      },
    });

    return typedjson({ tags: tags, error: undefined });
  } catch (e) {
    const error = handleError(e, "no tag was returned");

    if (error) {
      return typedjson({ error: error, tags: undefined });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
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

        return typedjson({
          tag: await prisma.tag.create({
            data: {
              name: name,
              color: color,
              category: category,
            },
          }),
          error: undefined,
        });
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    const error = handleError(e, "no tag was created");

    if (error) {
      return typedjson({ error: error, tag: undefined });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
}
