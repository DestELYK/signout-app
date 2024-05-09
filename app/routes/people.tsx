import { Prisma } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import { handleError } from "~/lib/db.server";
import { prisma } from "~/lib/prisma.server";
import { PostPersonFormData, personWithTags } from "~/utils/types.server";

export const meta: MetaFunction = () => {
  return [{ title: "People | SJK Sign-Out" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const firstName = url.searchParams.get("firstName");
  const lastName = url.searchParams.get("lastName");
  const nickname = url.searchParams.get("nickname");
  const qrCode = url.searchParams.get("qrCode");
  const query = url.searchParams.get("q") || url.searchParams.get("query");
  const limit = url.searchParams.get("limit");
  const offset = url.searchParams.get("offset");
  const display = url.searchParams.get("display");

  const filter: Prisma.PersonWhereInput = query
    ? ({
        ...(display === "students"
          ? {
              tags: {
                some: {
                  AND: [
                    {
                      category: "Person Role",
                    },
                    {
                      NOT: {
                        name: "Staff",
                      },
                    },
                  ],
                },
              },
            }
          : display === "staff" && { tags: { some: { name: "Staff" } } }),
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
      } satisfies Prisma.PersonWhereInput)
    : {
        ...(firstName && { firstName: firstName }),
        ...(lastName && { lastName: lastName }),
        ...(nickname && { nickname: nickname }),
        ...(qrCode && { qrCode: qrCode }),
        ...(display === "students"
          ? {
              tags: {
                some: {
                  AND: [
                    {
                      category: "Person Role",
                    },
                    {
                      NOT: {
                        name: "Staff",
                      },
                    },
                  ],
                },
              },
            }
          : display === "staff" && { tags: { some: { name: "Staff" } } }),
      };

  return typedjson({
    totalCount: await prisma.person.count({
      where: { ...filter, tags: undefined },
    }),
    studentCount: await prisma.person.count({
      where: {
        ...filter,
        tags: {
          some: {
            AND: [
              {
                category: "Person Role",
              },
              {
                NOT: {
                  name: "Staff",
                },
              },
            ],
          },
        },
      },
    }),
    staffCount: await prisma.person.count({
      where: {
        ...filter,
        tags: {
          some: {
            name: "Staff",
          },
        },
      },
    }),
    people: await prisma.person.findMany({
      where: filter,
      include: personWithTags.include,
      orderBy: [
        {
          firstName: "asc",
        },
        {
          lastName: "asc",
        },
        {
          nickname: "asc",
        },
      ],
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    }),
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const formData: PostPersonFormData = await request.json();

  try {
    switch (request.method) {
      case "POST":
        if (!formData.firstName) {
          throw new Error("FirstName must be provided");
        }

        if (!formData.lastName) {
          throw new Error("LastName must be provided");
        }

        if (!formData.role) {
          throw new Error("There must be a role");
        }

        return typedjson({
          person: await prisma.person.create({
            data: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              nickname: formData.nickname,
              qrCode: formData.qrCode,
              tags: {
                connect: formData.role,
              },
            },
            include: personWithTags.include,
          }),
          error: undefined,
        });
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    const error = handleError(e, "no item was created");

    if (error) {
      return typedjson({ error: error, person: undefined });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
}

export default function Page() {
  return <Outlet />;
}
