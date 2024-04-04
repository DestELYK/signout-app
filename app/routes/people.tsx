import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { error } from "console";
import { typedjson } from "remix-typedjson";
import { prisma } from "~/lib/prisma.server";
import { personFindMany } from "~/utils/types.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const firstName = url.searchParams.get("firstName");
  const lastName = url.searchParams.get("lastName");
  const nickname = url.searchParams.get("nickname");
  const qrCode = url.searchParams.get("qrCode");
  const query = url.searchParams.get("query");

  let filter: Prisma.PersonWhereInput = {};

  try {
    filter = query
      ? ({
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
        };
  } catch (e) {
    console.error("Failed to create filter for /people", error);
  }

  return typedjson(
    await prisma.person.findMany({
      where: filter,
      select: personFindMany.select,
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
    })
  );
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.json();

  try {
    switch (request.method) {
      case "POST":
        const firstName = formData.firstName;

        if (!firstName) {
          throw new Error("FirstName must be provided");
        }

        const lastName = formData.lastName;

        if (!lastName) {
          throw new Error("LastName must be provided");
        }

        const nickname = formData.nickname;

        const qrCode = formData.qrCode;

        const role: { id: number } = formData.role;

        if (!role) {
          throw new Error("There must be a role");
        }

        return typedjson(
          await prisma.person.create({
            data: {
              firstName: firstName,
              lastName: lastName,
              ...(nickname && { nickname: nickname }),
              ...(qrCode && { qrCode: qrCode }),
              role: {
                connect: role,
              },
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
