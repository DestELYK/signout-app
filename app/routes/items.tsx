import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import { prisma } from "~/lib/prisma.server";
import { itemFindMany } from "~/utils/types.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const loanId = url.searchParams.get("loanId");
  const qrCode = url.searchParams.get("qrCode");
  const name = url.searchParams.get("name");
  const type = url.searchParams.get("type");
  const query = url.searchParams.get("query");

  let filter: Prisma.ItemWhereInput = {};

  try {
    filter = query
      ? {
          name: {
            contains: query,
          },
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
  } catch (e) {
    console.error("Failed to create filter for /items", e);
  }

  return typedjson(
    await prisma.item.findMany({
      select: itemFindMany.select,
      where: filter,
      orderBy: [{ name: "asc" }],
    })
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.json();

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

        return typedjson(
          await prisma.item.create({
            data: {
              name: name,
              ...qrCode && {qrCode: qrCode},
              tags: {
                connect: tags
              }
            }
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
