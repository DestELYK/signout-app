import { Tag } from "@prisma/client";
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
  const formData: Tag = await request.json();

  try {
    switch (request.method) {
      case "POST":
        if (formData.name === undefined) {
          throw new Error("Name must be provided");
        }

        if (formData.color === undefined) {
          throw new Error("Color must be provided");
        }

        if (formData.category === undefined) {
          throw new Error("Category must be provided");
        }

        if (formData.priority === undefined) {
          formData.priority = 0;
        }

        if (formData.hidden === undefined) {
          formData.hidden = false;
        }

        // TODO - blacklist categories that can't be hidden

        return typedjson({
          tag: await prisma.tag.create({
            data: {
              name: formData.name,
              color: formData.color,
              priority: formData.priority,
              category: formData.category,
              hidden: formData.hidden,
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
