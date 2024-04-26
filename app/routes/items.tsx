import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useParams } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { handleError } from "~/lib/db.server";
import { prisma } from "~/lib/prisma.server";
import { PostItemFormData, itemWithTags } from "~/utils/types.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const loanId = url.searchParams.get("loanId");
  const qrCode = url.searchParams.get("qrCode");
  const name = url.searchParams.get("name");
  const type = url.searchParams.get("type");
  const query = url.searchParams.get("q") || url.searchParams.get("query");

  try {
    const filter: Prisma.ItemWhereInput = query
      ? {
          OR: [
            {
              AND: query.split(" ").map((s) => ({
                name: {
                  contains: s,
                },
              })),
            },
            {
              tags: {
                some: {
                  name: {
                    contains: query,
                  },
                },
              },
            },
          ],
          ...(loanId && {
            loans: {
              some: {
                loanId: parseInt(loanId),
              },
            },
          }),
        }
      : {
          ...(loanId && {
            loans: {
              some: {
                loanId: parseInt(loanId),
              },
            },
          }),
          ...(qrCode && { qrCode: qrCode }),
          ...(name && { name: name }),
          ...(type && { type: type }),
        };

    return typedjson({
      items: await prisma.item.findMany({
        include: itemWithTags.include,
        where: filter,
        orderBy: [
          {
            id: "desc",
          },
        ],
      }),
      error: undefined,
    });
  } catch (e) {
    const error = handleError(e, "no item was returned");

    if (error) {
      return typedjson({ error: error, items: undefined });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
};

export async function action({ request }: ActionFunctionArgs) {
  const formData: PostItemFormData = await request.json();

  try {
    switch (request.method) {
      case "POST":
        const name = formData.name;

        if (!name) {
          throw new Error("Name must be provided");
        }

        const qrCode = formData.qrCode;

        const tags: { id: number }[] = formData.tags;

        if (tags.length < 1) {
          throw new Error("There must be at least 1 tag");
        }

        const item = await prisma.item.create({
          data: {
            name: name,
            ...(qrCode && { qrCode: qrCode }),
            tags: {
              connect: tags,
            },
          },
          include: itemWithTags.include,
        });

        return typedjson({ item: item, error: undefined });
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    const error = handleError(e, "no item was created");

    if (error) {
      return typedjson({ error: error, item: undefined });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
}

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();

  const params = useParams();

  const itemId = params.itemId;

  let name;

  if (itemId) {
    name =
      data &&
      data.items &&
      data.items.find((i) => i.id.toString() === itemId)?.name;
  }

  return <Outlet />;
}
