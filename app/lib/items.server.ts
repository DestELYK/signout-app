import { Prisma } from "@prisma/client";
import { prisma } from "~/lib/prisma.server";
import { ItemWithTags, itemWithTags } from "~/utils/types.server";
import { isNumeric } from "~/utils/utils";

export const getItems = async (
  filters: {
    query?: string;
    qrCode?: string;
    name?: string;
    status?: string;
    types?: string[];
  },
  limit?: number,
  offset?: number
): Promise<{
  items?: ItemWithTags[];
  totalCount?: number;
  error?: string;
}> => {
  try {
    filters.query = filters.query?.trim().toLocaleLowerCase();
    filters.qrCode = filters.qrCode?.trim().toLocaleLowerCase();
    filters.name = filters.name?.trim().toLocaleLowerCase();
    filters.status = filters.status?.trim().toLocaleLowerCase();
    filters.types = filters.types?.map((t) => t.trim().toLocaleLowerCase());

    if (limit && limit <= 0) limit = undefined;

    const tagFilter: Prisma.TagListRelationFilter | undefined =
      filters.types || filters.status
        ? filters.status === "outstanding"
          ? {
              none: {
                category: "Item Status",
              },
              some: filters.types
                ? {
                    category: "Item Type",
                    name: {
                      in: filters.types,
                    },
                  }
                : undefined,
            }
          : filters.status === "available"
          ? {
              some: filters.types
                ? {
                    category: "Item Type",
                    name: {
                      in: filters.types,
                    },
                  }
                : undefined,
            }
          : {
              some: {
                AND: [
                  ...(filters.status
                    ? [
                        {
                          category: "Item Status",
                          name: filters.status,
                        },
                      ]
                    : []),
                  ...(filters.types
                    ? [
                        {
                          category: "Item Type",
                          name: {
                            in: filters.types,
                          },
                        },
                      ]
                    : []),
                ],
              },
            }
        : undefined;

    const loanFilter: Prisma.LoanedItemListRelationFilter | undefined =
      filters.status
        ? filters.status === "outstanding"
          ? {
              some: {
                dateReturned: null,
              },
            }
          : filters.status === "available"
          ? {
              none: {
                dateReturned: null,
              },
            }
          : {
              some: {
                dateReturned: null,
              },
            }
        : undefined;

    const filter: Prisma.ItemWhereInput =
      filters.query && filters.query.length > 0
        ? {
            AND: filters.query.split(" ").map((s) => ({
              name: {
                contains: s,
              },
            })),
            loans: loanFilter,
            tags: tagFilter,
          }
        : filters.qrCode
        ? {
            qrCode: filters.qrCode,
          }
        : {
            ...(filters.name
              ? {
                  AND: filters.name
                    .split(" ")
                    .map((s) => ({ name: { contains: s } })),
                }
              : undefined),
            loans: loanFilter,
            tags: tagFilter,
          };

    const items = await prisma.item.findMany({
      where: filter,
      include: itemWithTags.include,
      orderBy: {
        id: "desc",
      },
      take: limit,
      skip: offset,
    });

    return {
      items: items,
      totalCount: await prisma.item.count({ where: filter }),
    };
  } catch (e) {
    console.error(`Failed to get items`, e);

    let message = "Unknown Error";
    if (e instanceof Error) message = e.message;

    return { error: message };
  }
};

export const getItemById = async (
  id: string
): Promise<{ item?: ItemWithTags; error?: string }> => {
  try {
    if (!isNumeric(id)) throw new Error("Invalid ID");

    const item = await prisma.item.findUnique({
      where: {
        id: Number(id),
      },
      include: itemWithTags.include,
    });

    if (!item) throw new Error("Item not found");

    return { item: item };
  } catch (e) {
    console.error(`Failed to get item by id`, e);

    let message = "Unknown Error";
    if (e instanceof Error) message = e.message;

    return { error: message };
  }
};
