/**
 * Items Server Operations
 *
 * Server-side functions for managing items in the signout system.
 * Handles CRUD operations, queries, and business logic for inventory
 * management including item types, locations, and loan tracking.
 *
 *
 * @module ItemsServer
 *
 * @author Kyle Dunn
 */

import { Prisma, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { INVALID_STATUS_IDS, STATUS_OPTIONS } from "~/utils/consts";
import {
    DataReturn,
    InvalidItemData,
    itemAdvancedSelection,
    ItemData,
    ItemsByTypeData,
    itemSimpleSelection,
    ItemTypeData,
    LocationData,
} from "~/utils/types.server";
import { handleError } from "./db.server";
import {
    ItemFormSchema,
    ItemFormType,
    ItemQuerySchema,
    ItemQueryType,
    ItemTypeType as ItemTypeFormType,
    ItemTypeSchema,
    LocationSchema,
    LocationType,
    QuerySchema,
    QueryType,
} from "./schemas";

import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { getItemStatus } from "~/utils/utils";
import { getLastLoan } from "./loans.server";

const prisma = new PrismaClient();

dayjs.extend(isSameOrBefore);

//#region Items

/**
 * Retrieve a list of items with optional filtering, pagination, and search
 *
 * @param filters - Object containing filter criteria for item search
 * @param limit - Maximum number of results to return
 * @param offset - Number of results to skip for pagination
 * @returns Promise resolving to DataReturn with items array or error
 */
export const getItems = async (
  filters: Partial<{
    [key in keyof ItemQueryType]: string | string[] | undefined;
  }> = {},
  limit?: number,
  offset?: number
): Promise<DataReturn<ItemData[]>> => {
  try {
    const parsedFilter = ItemQuerySchema.parse(filters);

    if (limit && limit <= 0) limit = undefined;

    if (parsedFilter.query && parsedFilter.query.length > 0) {
      parsedFilter.name = parsedFilter.query;
    }

    // Build ordering from query parameters with fallback
    const finalOrder = parsedFilter.order || ["desc"];

    // Build orderBy object based on sort fields
    const buildOrderBy = (
      sortBy: string[] | null | undefined,
      order: string[] | null | undefined
    ): Prisma.ItemFindManyArgs["orderBy"] => {
      if (!sortBy || sortBy.length === 0) {
        return { createdDate: finalOrder[0] as "asc" | "desc" };
      }

      return sortBy.map((field, index) => {
        const fieldOrder = (order?.[index] || finalOrder[0]) as "asc" | "desc";
        switch (field) {
          case "location":
            return {
              location: {
                name: fieldOrder,
              },
            };
          case "type":
            return {
              type: {
                name: fieldOrder,
              },
            };
          case "name":
          case "description":
          case "createdDate":
          case "updatedDate":
            return { [field]: fieldOrder };
          default:
            return { createdDate: fieldOrder };
        }
      });
    };

    // Process statuses array to handle both IDs and names
    const processedStatuses =
      parsedFilter.statuses && parsedFilter.statuses.length > 0
        ? parsedFilter.statuses
            .map((status) => {
              // Find status by ID or name
              const statusOption = STATUS_OPTIONS.find((s) => s.id === status || s.name === status);
              return statusOption?.id;
            })
            .filter((status): status is string => status !== undefined)
        : undefined;

    const hasReturnedStatus = parsedFilter.statuses?.some(
      (status) =>
        ["returned", "available"].includes(status) ||
        STATUS_OPTIONS.some(
          (s) => (s.id === status || s.name === status) && ["returned", "available"].includes(s.id)
        )
    );
    const hasActiveStatuses =
      processedStatuses && processedStatuses.some((status) => status !== "returned");

    const filter: Prisma.ItemWhereInput = parsedFilter.uuid
      ? { uuid: parsedFilter.uuid }
      : {
          name: parsedFilter.name ? { contains: parsedFilter.name } : undefined,
          // Handle multiple status filtering
          ...(parsedFilter.statuses && parsedFilter.statuses.length > 0
            ? {
                OR: [
                  // Items with active statuses (not returned)
                  ...(hasActiveStatuses
                    ? [
                        {
                          loans: {
                            some: {
                              status: {
                                in: processedStatuses.filter((s) => s !== "returned"),
                              },
                            },
                          },
                        },
                      ]
                    : []),
                  // Items with no loans or all returned loans (available status)
                  ...(hasReturnedStatus
                    ? [
                        {
                          OR: [
                            { loans: { none: {} } }, // No loans = available
                            { loans: { every: { status: "returned" } } }, // All loans returned
                          ],
                        },
                      ]
                    : []),
                ],
              }
            : parsedFilter.personId
            ? {
                loans: {
                  some: {
                    loan: {
                      personId: parsedFilter.personId,
                    },
                  },
                },
              }
            : {}),
          type: parsedFilter.types
            ? {
                OR: parsedFilter.types.map((type) => ({ name: type })),
              }
            : undefined,
          location:
            parsedFilter.locations && parsedFilter.locations.length > 0
              ? {
                  name: { in: parsedFilter.locations },
                }
              : undefined,
          tags: parsedFilter.tags ? { some: { id: { in: parsedFilter.tags } } } : undefined,
        };

    const items = await prisma.item.findMany({
      ...itemSimpleSelection,
      where: filter,
      orderBy: buildOrderBy(parsedFilter.sortBy, parsedFilter.order),
      take: limit,
      skip: offset,
    });

    let filteredItems = items.map((item) => ({
      id: item.id,
      uuid: item.uuid,
      name: item.name,
      description: item.description ?? undefined,
      status: getItemStatus(item.loans.map((loan) => loan.status)),
      type: item.type,
      location: item.location,
      tags: item.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        description: tag.description ?? undefined,
        priority: tag.priority,
        hidden: tag.hidden,
        category: tag.category,
      })),
    }));

    const totalCount = await prisma.item.count({
      where: filter,
    });

    return {
      data: filteredItems,
      totalCount: totalCount,
    };
  } catch (e) {
    return { error: handleError(e, "failed to get items") };
  }
};

export const getItemById = async (id?: string | number): Promise<DataReturn<ItemData>> => {
  try {
    const itemId = z.coerce.number().int().parse(id);

    const item = await prisma.item.findUnique({
      ...itemAdvancedSelection,
      where: {
        id: itemId,
      },
    });

    if (!item) throw new Error("Item not found");

    const lastLoan = await getLastLoan(undefined, item.id);

    const status = getItemStatus(item.loans.map((loan) => loan.status));

    return {
      data: {
        id: item.id,
        uuid: item.uuid,
        name: item.name,
        description: item.description ?? undefined,
        status: status,
        type: item.type,
        location: item.location,
        loans: item.loans.map((loan) => ({
          id: loan.loan.id,
          dateLoaned: loan.dateLoaned,
          dateReturned: loan.dateReturned ?? undefined,
          status: STATUS_OPTIONS.find((status) => status.id === loan.status),
          person: {
            id: loan.loan.person.id,
            firstName: loan.loan.person.firstName,
            lastName: loan.loan.person.lastName,
            nickname: loan.loan.person.nickname ?? undefined,
            role: {
              id: loan.loan.person.role.id,
              name: loan.loan.person.role.name,
              description: loan.loan.person.role.description ?? undefined,
              color: loan.loan.person.role.color,
            },
          },
          itemCount: loan.loan._count.items,
        })) satisfies ItemData["loans"],
        lastLoan: lastLoan.data,
        tags: item.tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          description: tag.description ?? undefined,
          priority: tag.priority,
          hidden: tag.hidden,
          category: tag.category,
        })),
        createdDate: item.createdDate,
        updatedDate: item.updatedDate,
        totalLoansCount: item.loans.length,
        notes: item.notes ?? undefined,
        outstandingLoansCount: item.loans.filter((loan) => loan.status !== "returned").length,
        uniquePeopleCount: item.loans.reduce(
          (acc, loan) => (acc.includes(loan.loan.person.id) ? acc : [...acc, loan.loan.person.id]),
          [] as number[]
        ).length,
      } satisfies ItemData,
    };
  } catch (e) {
    return { error: handleError(e, "failed to get item by ID") };
  }
};
export const createItem = async (data: ItemFormType): Promise<DataReturn<ItemData>> => {
  try {
    const item = ItemFormSchema.parse(data);

    let uuid = randomUUID().toString();
    while (true) {
      const existingItem = await prisma.item.findUnique({
        where: {
          uuid: uuid,
        },
      });

      if (!existingItem) {
        break;
      }

      uuid = randomUUID().toString();
    }

    const newItem = await prisma.item.create({
      ...itemSimpleSelection,
      data: {
        uuid: uuid,
        name: item.name,
        description: item.description,
        type: {
          connect: {
            id: item.type.id,
          },
        },
        location: {
          connect: {
            id: item.location.id,
          },
        },
        tags: {
          connect: item.tags?.map((tag) => ({ id: tag.id })),
        },
        notes: item.notes,
      },
    });

    return {
      data: {
        id: newItem.id,
        uuid: newItem.uuid,
        name: newItem.name,
        type: newItem.type,
      },
    };
  } catch (e) {
    return { error: handleError(e, "failed to create item") };
  }
};

export const updateItem = async (
  id?: string,
  data?: Partial<ItemFormType>
): Promise<DataReturn<ItemData>> => {
  try {
    const itemId = z.coerce.number().int().parse(id);
    const item = ItemFormSchema.partial().parse(data);
    const itemStatus = STATUS_OPTIONS.find((s) => s.id === item.status);

    const updatedItem = await prisma.item.update({
      ...itemSimpleSelection,
      where: {
        id: itemId,
      },
      data: {
        name: item.name,
        description: item.description,
        type: item.type
          ? {
              connect: {
                id: item.type.id,
              },
            }
          : undefined,
        location: item.location
          ? {
              connect: {
                id: item.location.id,
              },
            }
          : undefined,
        notes: item.notes,
        tags: item.tags
          ? {
              set: item.tags?.map((tag) => ({ id: tag.id })),
            }
          : undefined,
      },
    });

    if (itemStatus) {
      const lastLoan = await getLastLoan(undefined, updatedItem.id);

      if (lastLoan.data) {
        const updatedLoan = await prisma.loanedItem.update({
          where: {
            loanId_itemId: {
              loanId: lastLoan.data.id,
              itemId: updatedItem.id,
            },
          },
          data: {
            status: itemStatus.id,
            dateReturned: itemStatus.id === "out" ? null : new Date(),
          },
        });
      }
    }

    return {
      data: {
        id: updatedItem.id,
        uuid: updatedItem.uuid,
        name: updatedItem.name,
        type: updatedItem.type,
      },
    };
  } catch (e) {
    return { error: handleError(e, "failed to update item") };
  }
};

export const deleteItem = async (id?: string): Promise<DataReturn<ItemData>> => {
  try {
    const itemId = z.coerce.number().int().parse(id);

    const item = await prisma.item.delete({
      where: {
        id: itemId,
      },
      ...itemSimpleSelection,
    });

    return {
      data: {
        id: item.id,
        uuid: item.uuid,
        name: item.name,
      },
    };
  } catch (e) {
    return { error: handleError(e, "failed to delete item") };
  }
};

export const deleteItems = async (data: { itemIds: string[] }): Promise<DataReturn<number>> => {
  try {
    const itemIds = z.array(z.coerce.number().int()).parse(data.itemIds);

    const items = await prisma.item.deleteMany({
      where: {
        id: {
          in: itemIds,
        },
      },
    });

    return { data: items.count };
  } catch (e) {
    return { error: handleError(e, "failed to delete items") };
  }
};
//#endregion

export const getItemCount = async (): Promise<DataReturn<number>> => {
  try {
    const count = await prisma.item.count();

    return {
      data: count,
    };
  } catch (e) {
    return { error: handleError(e, "failed to get item count") };
  }
};

export const getOutstandingItemsCount = async (): Promise<DataReturn<number>> => {
  try {
    const count = await prisma.item.count({
      where: {
        loans: {
          some: {
            dateReturned: null,
          },
        },
      },
    });

    return {
      data: count,
    };
  } catch (e) {
    return { error: handleError(e, "failed to get outstanding item count") };
  }
};

//#region Item Grouping
export const getItemsGroupedByType = async (): Promise<
  DataReturn<{
    itemByTypes: ItemsByTypeData[];
    types: ItemTypeData[];
  }>
> => {
  try {
    let itemsByType: ItemsByTypeData[] = [];

    const allItems = await prisma.item.findMany({
      ...itemSimpleSelection,
    });

    const types = await prisma.itemType.findMany();

    types.forEach((type) => {
      const statusCount: { [key: string]: number } = STATUS_OPTIONS.reduce(
        (acc, status) => ({ ...acc, [status.id]: 0 }),
        {}
      );

      const itemsForType = allItems.filter((item) => item.type.id === type.id);
      itemsForType.forEach((item) => {
        statusCount[item.loans.length > 0 ? item.loans[0].status : "returned"]++;
      });

      itemsByType.push({
        typeId: type.id,
        type: type.name,
        statusCount: statusCount,
        total: itemsForType.length,
      });
    });

    return {
      data: {
        itemByTypes: itemsByType,
        types: types,
      },
    };
  } catch (e) {
    return { error: handleError(e, "failed to get item types") };
  }
};

export const getItemStatusCount = async (): Promise<
  DataReturn<{
    statusCount: { [key: string]: { count: number; name: string; color: string } };
    items: InvalidItemData[];
  }>
> => {
  try {
    const result = await getItems();
    if (result.error) {
      return { error: result.error };
    } else if (!result.data) {
      return { error: "Failed to get items" };
    }

    if (result.data !== undefined) {
      const statusCount: { [key: string]: { count: number; name: string; color: string } } = {};

      STATUS_OPTIONS.forEach((status) => {
        statusCount[status.id] = {
          count: result.data!.filter((item) => item.status && item.status.id === status.id).length,
          name: status.name,
          color: status.color,
        };
      });

      const invalidItems = result.data.filter((item) => {
        return item.status && INVALID_STATUS_IDS.includes(item.status.id);
      });

      return {
        data: {
          statusCount,
          items: invalidItems,
        },
      };
    } else {
      return { error: "Failed to get items" };
    }
  } catch (e) {
    return { error: handleError(e, "failed to get invalid items") };
  }
};
//#endregion

//#region Item Types
export const getItemTypes = async (
  filters: Partial<{
    [key in keyof QueryType]: string | string[] | undefined;
  }> = {}
): Promise<DataReturn<ItemTypeData[]>> => {
  try {
    const parsedFilter = QuerySchema.parse(filters);

    // Build ordering from query parameters with fallback
    const finalOrder = parsedFilter.order || ["desc"];

    // Build orderBy object based on sort fields
    const buildOrderBy = (
      sortBy: string[] | null | undefined,
      order: string[] | null | undefined
    ): Prisma.ItemTypeFindManyArgs["orderBy"] => {
      if (!sortBy || sortBy.length === 0) {
        return { name: finalOrder[0] as "asc" | "desc" };
      }

      return sortBy.map((field, index) => {
        const fieldOrder = (order?.[index] || finalOrder[0]) as "asc" | "desc";
        switch (field) {
          case "id":
          case "name":
          case "description":
            return { [field]: fieldOrder };
          default:
            return { name: fieldOrder };
        }
      });
    };

    const itemTypes = await prisma.itemType.findMany({
      where: parsedFilter.query
        ? {
            name: {
              contains: parsedFilter.query,
            },
          }
        : undefined,
      orderBy: buildOrderBy(parsedFilter.sortBy, parsedFilter.order),
    });

    return {
      data: itemTypes.map((type) => ({
        id: type.id,
        name: type.name,
        description: type.description ?? undefined,
      })),
    };
  } catch (e) {
    return { error: handleError(e, "failed to get item types") };
  }
};

export const getItemTypeById = async (id: string): Promise<DataReturn<ItemTypeData>> => {
  try {
    const itemTypedId = z.coerce.number().int().parse(id);

    const itemType = await prisma.itemType.findUnique({
      where: {
        id: itemTypedId,
      },
    });

    if (!itemType) throw new Error("Item type not found");

    return {
      data: {
        id: itemType.id,
        name: itemType.name,
        description: itemType.description ?? undefined,
      },
    };
  } catch (e) {
    return { error: handleError(e, "failed to get item type by ID") };
  }
};

export const createItemType = async (data: ItemTypeFormType): Promise<DataReturn<ItemTypeData>> => {
  try {
    const itemType = ItemTypeSchema.parse(data);

    const newItemType = await prisma.itemType.create({
      data: {
        name: itemType.name,
        description: itemType.description,
      },
    });

    return {
      data: {
        id: newItemType.id,
        name: newItemType.name,
        description: newItemType.description ?? undefined,
      },
    };
  } catch (e) {
    return { error: handleError(e, "failed to create item type") };
  }
};

export const updateItemType = async (
  id?: number | string,
  data?: ItemTypeFormType
): Promise<DataReturn<ItemTypeData>> => {
  try {
    const itemTypeId = z.coerce.number().int().min(0).parse(id);

    const itemType = ItemTypeSchema.parse(data);

    const updatedItemType = await prisma.itemType.update({
      where: {
        id: itemTypeId,
      },
      data: {
        name: itemType.name,
        description: itemType.description ?? undefined,
      },
    });

    return {
      data: {
        id: updatedItemType.id,
        name: updatedItemType.name,
        description: updatedItemType.description ?? undefined,
      },
    };
  } catch (e) {
    return { error: handleError(e, "failed to update item type") };
  }
};

export const deleteItemType = async (id?: number | string): Promise<DataReturn<ItemTypeData>> => {
  try {
    const itemTypeId = z.coerce.number().int().min(0).parse(id);

    const itemType = await prisma.itemType.delete({
      where: {
        id: itemTypeId,
      },
    });

    return {
      data: {
        id: itemType.id,
        name: itemType.name,
        description: itemType.description ?? undefined,
      },
    };
  } catch (e) {
    return { error: handleError(e, "failed to delete item type") };
  }
};
//#endregion

//#region Item Locations
export const getItemLocations = async (
  filters: Partial<{
    [key in keyof QueryType]: string | string[] | undefined;
  }> = {}
): Promise<DataReturn<LocationData[]>> => {
  try {
    const parsedFilter = QuerySchema.parse(filters);

    // Build ordering from query parameters with fallback
    const finalOrder = parsedFilter.order || ["desc"];

    // Build orderBy object based on sort fields
    const buildOrderBy = (
      sortBy: string[] | null | undefined,
      order: string[] | null | undefined
    ): Prisma.LocationFindManyArgs["orderBy"] => {
      if (!sortBy || sortBy.length === 0) {
        return { name: finalOrder[0] as "asc" | "desc" };
      }

      return sortBy.map((field, index) => {
        const fieldOrder = (order?.[index] || finalOrder[0]) as "asc" | "desc";
        switch (field) {
          case "id":
          case "name":
            return { [field]: fieldOrder };
          default:
            return { name: fieldOrder };
        }
      });
    };

    const itemLocations = await prisma.location.findMany({
      where: parsedFilter.query
        ? {
            AND: parsedFilter.query.split(" ").map((query) => ({
              name: {
                contains: query,
              },
            })),
          }
        : undefined,
      orderBy: buildOrderBy(parsedFilter.sortBy, parsedFilter.order),
    });

    return {
      data: itemLocations.map((location) => ({
        id: location.id,
        name: location.name,
      })),
    };
  } catch (e) {
    return { error: handleError(e, "failed to get item locations") };
  }
};

export const getItemLocationById = async (id: string): Promise<DataReturn<LocationData>> => {
  try {
    const itemLocationId = z.coerce.number().int().parse(id);

    const itemLocation = await prisma.location.findUnique({
      where: {
        id: itemLocationId,
      },
    });

    if (!itemLocation) throw new Error("Item location not found");

    return {
      data: {
        id: itemLocation.id,
        name: itemLocation.name,
      },
    };
  } catch (e) {
    return { error: handleError(e, "failed to get item location by ID") };
  }
};

export const createItemLocation = async (data: LocationType): Promise<DataReturn<LocationData>> => {
  try {
    const itemLocation = LocationSchema.parse(data);

    const createdItemLocation = await prisma.location.create({
      data: {
        name: itemLocation.name,
      },
    });

    return {
      data: { id: createdItemLocation.id, name: createdItemLocation.name },
    };
  } catch (e) {
    return { error: handleError(e, "failed to create item location") };
  }
};

export const updateItemLocation = async (
  id: string,
  data: LocationType
): Promise<DataReturn<LocationData>> => {
  try {
    const itemLocationId = z.coerce.number().int().parse(id);

    const itemLocation = LocationSchema.parse(data);

    const updatedItemLocation = await prisma.location.update({
      where: {
        id: itemLocationId,
      },
      data: {
        name: itemLocation.name,
      },
    });

    return {
      data: { id: updatedItemLocation.id, name: updatedItemLocation.name },
    };
  } catch (e) {
    return { error: handleError(e, "failed to update item location") };
  }
};

export const deleteItemLocation = async (id: string): Promise<DataReturn<LocationData>> => {
  try {
    const itemLocationId = z.coerce.number().int().parse(id);

    const itemLocation = await prisma.location.delete({
      where: {
        id: itemLocationId,
      },
    });

    return {
      data: { id: itemLocation.id, name: itemLocation.name },
    };
  } catch (e) {
    return { error: handleError(e, "failed to delete item location") };
  }
};
//#endregion
