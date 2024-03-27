import { Prisma } from "@prisma/client";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { error } from "console";
import { prisma } from "~/lib/prisma.server";

export const personSelect: Prisma.PersonSelect = {
  id: true,
  qrCode: true,
  firstName: true,
  lastName: true,
  nickname: true,
  role: true,
  notes: true,
  createdDate: true,
  updatedDate: true,
  _count: {
    select: {
      loans: {
        where: {
          items: {
            some: {
              dateReturned: null,
            },
          },
        },
      },
    },
  },
};

const personWithCount = Prisma.validator<Prisma.PersonDefaultArgs>()({
  select: personSelect,
});

export type PersonWithCount = Prisma.PersonGetPayload<typeof personWithCount>;

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

  return json(
    await prisma.person.findMany({
      where: filter,
      select: personSelect,
      orderBy: [
        {
            firstName: "asc"
        },
        {
            lastName: "asc"
        },
        {
            nickname: "asc"
        }
      ]
    })
  );
};
