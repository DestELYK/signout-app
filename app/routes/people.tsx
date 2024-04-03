import { Prisma } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
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
