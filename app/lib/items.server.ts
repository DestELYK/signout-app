import { Prisma, Tag } from "@prisma/client";
import { prisma } from "~/lib/prisma.server";
import { ItemWithTags, itemWithTags } from "~/utils/types.server";
import { formatFullName, isNumeric } from "~/utils/utils";

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

export const getItemTypes = async (): Promise<{
  itemsByType?: {
    typeId: number;
    type: string;
    available: number;
    outstanding: number;
    total: number;
    color: string;
  }[];
  itemTypes?: Tag[];
  error?: string;
}> => {
  try {
    let itemsByType: {
      typeId: number;
      type: string;
      available: number;
      outstanding: number;
      total: number;
      color: string;
    }[] = [];

    const allItems = await prisma.item.findMany({
      include: {
        loans: {
          select: {
            dateLoaned: true,
            dateReturned: true,
          },
        },
        tags: true,
      },
    });

    const types = await prisma.tag.findMany({
      where: { category: "Item Type", hidden: false },
      orderBy: [{ priority: "asc" }, { name: "asc" }],
    });

    types.forEach((type) => {
      const available = allItems.filter(
        (item) =>
          item.tags.find((tag) => tag.id === type.id) &&
          item.loans.filter((loan) => loan.dateReturned === null).length === 0
      ).length;
      const outstanding = allItems.filter(
        (item) =>
          item.tags.find((tag) => tag.id === type.id) &&
          item.loans.filter((loan) => loan.dateReturned === null).length > 0
      ).length;

      itemsByType.push({
        typeId: type.id,
        type: type.name,
        available: available,
        outstanding: outstanding,
        total: available + outstanding,
        color: type.color,
      });
    });

    return {
      itemsByType: itemsByType,
      itemTypes: types,
    };
  } catch (e) {
    console.error(`Failed to get item types`, e);

    let message = "Unknown Error";
    if (e instanceof Error) message = e.message;

    return { error: message };
  }
};

export const getInvalidItems = async (): Promise<{
  statusCount?: { [key: string]: { count: number; color: string } };
  invalidItems?: {
    id: number;
    name: string;
    status: Tag;
    lastLoan: { id: number; personId: number; fullName: string; date: Date };
  }[];
  error?: string;
}> => {
  try {
    let statusCount: { [key: string]: { count: number; color: string } } = {};
    let invalidItems: {
      id: number;
      name: string;
      status: Tag;
      lastLoan: { id: number; personId: number; fullName: string; date: Date };
    }[] = [];

    const allItems = await prisma.item.findMany({
      include: {
        loans: {
          select: {
            loanId: true,
            dateLoaned: true,
            dateReturned: true,
            loan: {
              select: {
                person: {
                  include: {
                    tags: true,
                  },
                },
              },
            },
          },
        },
        tags: true,
      },
      where: {
        AND: [
          {
            tags: {
              some: {
                category: "Item Status",
              },
            },
          },
          {
            loans: {
              some: {
                dateReturned: null,
              },
            },
          },
        ],
      },
    });

    const statuses = await prisma.tag.findMany({
      where: {
        category: "Item Status",
      },
    });

    statuses.forEach((status) => {
      statusCount[status.name] = {
        count: allItems.filter((item) =>
          item.tags.find((tag) => tag.id === status.id)
        ).length,
        color: status.color,
      };

      const invalid = allItems.filter((item) =>
        item.tags.find((tag) => tag.id === status.id)
      );

      for (let i = 0; i < invalid.length; i++) {
        const invalidItem = invalid[i];

        const lastLoan = invalidItem.loans.reduce((prev, current) =>
          prev.dateLoaned > current.dateLoaned ? prev : current
        );

        // Check if item already exists in the list
        const existingItem = invalidItems.find(
          (item) => item.id === invalidItem.id
        );

        if (existingItem) {
          continue;
        }

        invalidItems.push({
          id: invalidItem.id,
          name: invalidItem.name,
          status: status,
          lastLoan: {
            id: lastLoan.loanId,
            personId: lastLoan.loan.person.id,
            fullName: formatFullName(lastLoan.loan.person),
            date: lastLoan.dateLoaned,
          },
        });
      }
    });

    return {
      statusCount: statusCount,
      invalidItems: invalidItems,
    };
  } catch (e) {
    console.error(`Failed to get invalid items`, e);

    let message = "Unknown Error";
    if (e instanceof Error) message = e.message;

    return { error: message };
  }
};
