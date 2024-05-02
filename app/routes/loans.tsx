import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { MetaFunction, Outlet } from "@remix-run/react";
import { redirect, typedjson } from "remix-typedjson";
import { prisma } from "~/lib/prisma.server";
import {
  PostLoanFormData,
  loanWithTags,
  loanWithTagsAndItems,
} from "~/utils/types.server";

export const meta: MetaFunction = () => {
  return [{ title: "Loans" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.pathname.endsWith("/")) {
    return redirect("/loans");
  }

  const itemIds = url.searchParams.getAll("itemId");
  const personId = url.searchParams.get("personId");
  const qrCode = url.searchParams.get("qrCode");
  const query = url.searchParams.get("q");
  const limit = url.searchParams.get("limit");
  const offset = url.searchParams.get("offset");
  const display = url.searchParams.get("display");

  let filter: Prisma.LoanWhereInput = query
    ? {
        OR: [
          {
            person: {
              OR: [
                {
                  firstName: {
                    contains: query,
                  },
                },
                {
                  lastName: {
                    contains: query,
                  },
                },
                {
                  nickname: {
                    contains: query,
                  },
                },
                {
                  AND: {
                    OR: [
                      { firstName: { contains: query.split(" ", 2)[0] } },
                      { nickname: { contains: query.split(" ", 2)[0] } },
                    ],
                    lastName: { contains: query.split(" ", 2)[1] },
                  },
                },
              ],
            },
          },
          {
            items: {
              some: {
                item: {
                  name: {
                    contains: query,
                  },
                },
              },
            },
          },
        ],
      }
    : qrCode
    ? {
        OR: [
          {
            person: {
              qrCode: qrCode,
            },
          },
          {
            items: {
              some: {
                item: {
                  qrCode: qrCode,
                },
              },
            },
          },
        ],
      }
    : {
        ...(itemIds &&
          itemIds.length > 0 && {
            items: {
              some: {
                OR: itemIds.map((itemId) => {
                  return {
                    itemId: parseInt(itemId),
                  };
                }),
              },
            },
          }),
        ...(personId && { personId: parseInt(personId) }),
        ...(display === "outstanding"
          ? { items: { some: { dateReturned: null } } }
          : display === "returned" && {
              items: { none: { dateReturned: null } },
            }),
      };

  return typedjson({
    totalCount: await prisma.loan.count({
      where: { ...filter, items: undefined },
    }),
    outCount: await prisma.loan.count({
      where: {
        ...filter,
        items: {
          some: {
            dateReturned: null,
          },
        },
      },
    }),
    inCount: await prisma.loan.count({
      where: {
        ...filter,
        items: {
          none: {
            dateReturned: null,
          },
        },
      },
    }),
    loans: await prisma.loan.findMany({
      include: {
        ...loanWithTagsAndItems.include,
      },
      where: filter,
      orderBy: [
        {
          id: "desc",
        },
      ],
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    }),
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const formData: PostLoanFormData = await request.json();

  try {
    switch (request.method) {
      case "POST":
        if (!formData.person || formData.person.id === -1) {
          throw Error("No person selected");
        }

        if (!formData.items || formData.items.length == 0) {
          throw Error("Loan requires at least one item");
        }

        const outstandingItems = await prisma.loanedItem.findMany({
          where: {
            AND: [
              {
                OR: formData.items.map((i) => {
                  return {
                    itemId: i.id,
                  };
                }),
              },
              {
                dateReturned: null,
              },
            ],
          },
        });

        if (outstandingItems.length > 0) {
          throw Error("One of the items is currently outstanding!");
        }

        const result = await prisma.loan.create({
          data: {
            person: {
              connect: {
                id: formData.person.id,
              },
            },
            items: {
              create: formData.items.map((item) => ({
                item: {
                  connect: {
                    id: item.id,
                  },
                },
              })),
            },
            tags: {
              connect: formData.tags.map((tag) => ({
                id: tag.id,
              })),
            },
          },
          include: loanWithTags.include,
        });

        console.debug("Created new loan: %s", result);

        return typedjson({ loan: result, error: undefined });
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    console.error(`Failed to ${request.method} a loan`, e);

    let message = "Unknown Error";
    if (e instanceof Error) message = e.message;

    return typedjson({ error: message, loan: undefined });
  }
}

export default function Page() {
  return <Outlet />;
}
