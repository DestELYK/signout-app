import { Prisma } from "@prisma/client";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

const itemSelect: Prisma.ItemSelect = {
  id: true,
  name: true,
  qrCode: true,
  type: true,
  notes: true,
  createdDate: true,
  updatedDate: true,
  _count: {
    select: {
      loans: { where: { dateReturned: null } },
    },
  },
};

const itemWithCount = Prisma.validator<Prisma.ItemDefaultArgs>()({
  select: itemSelect,
});

export type ItemWithCount = Prisma.ItemGetPayload<typeof itemWithCount>;

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

  return json(
    await prisma.item.findMany({
      select: itemSelect,
      where: filter,
      orderBy: [{ type: "asc" }, { name: "asc" }],
    })
  );
}
