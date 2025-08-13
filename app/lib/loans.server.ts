import { Prisma, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { z } from "zod";
import { INVALID_STATUS_IDS, LOAN_STATUSES, STATUS_OPTIONS } from "~/utils/consts";
import {
    DataReturn,
    ItemStatusData,
    LastLoanData,
    loanAdvancedSelection,
    LoanData,
    LoanedItemData,
    loanSimpleSelection,
} from "~/utils/types.server";
import { getLoanStatus } from "~/utils/utils";
import { handleError } from "./db.server";
import { LoanFormSchema, LoanFormType, LoanQuerySchema, LoanQueryType } from "./schemas";

const prisma = new PrismaClient();

dayjs.extend(isSameOrAfter);

//#region Loans
export const getLoans = async (
    filters: {
        [key in keyof LoanQueryType]?: string | string[] | number | boolean | undefined;
    },
    order: Prisma.LoanOrderByWithAggregationInput = {
        id: "desc",
    },
    limit?: number,
    offset?: number
): Promise<DataReturn<LoanData[]>> => {
    try {
        const parsedFilter = LoanQuerySchema.parse(filters);

        if (limit && limit <= 0) limit = undefined;

        const statuses = STATUS_OPTIONS.filter((status) => {
            if (status.id === "out") {
                return (
                    parsedFilter.statuses?.includes("out") ||
                    parsedFilter.statuses?.includes("outstanding")
                );
            } else if (status.id === "unknown") {
                return (
                    parsedFilter.statuses?.includes("unknown") ||
                    parsedFilter.statuses?.includes("unknown status")
                );
            } else {
                return parsedFilter.statuses?.includes(status.id);
            }
        }).map((status) => status.id);

        const filter: Prisma.LoanWhereInput =
            parsedFilter.query && parsedFilter.query.length > 0
                ? {
                      ...(statuses?.includes("out")
                          ? { items: { some: { status: "out" } } }
                          : statuses?.includes("returned")
                          ? {
                                items: { every: { status: "returned" } },
                            }
                          : statuses?.includes("invalid") && {
                                items: {
                                    some: {
                                        status: {
                                            in: INVALID_STATUS_IDS,
                                        },
                                    },
                                },
                            }),
                      OR: [
                          {
                              person: {
                                  OR: [
                                      {
                                          firstName: {
                                              contains: parsedFilter.query,
                                          },
                                      },
                                      {
                                          lastName: {
                                              contains: parsedFilter.query,
                                          },
                                      },
                                      {
                                          nickname: {
                                              contains: parsedFilter.query,
                                          },
                                      },
                                      {
                                          AND: {
                                              OR: [
                                                  {
                                                      firstName: {
                                                          contains: parsedFilter.query.split(
                                                              " ",
                                                              2
                                                          )[0],
                                                      },
                                                  },
                                                  {
                                                      nickname: {
                                                          contains: parsedFilter.query.split(
                                                              " ",
                                                              2
                                                          )[0],
                                                      },
                                                  },
                                              ],
                                              lastName: {
                                                  contains: parsedFilter.query.split(" ", 2)[1],
                                              },
                                          },
                                      },
                                  ],
                              },
                          },
                          {
                              items: {
                                  some: {
                                      item: {
                                          AND: parsedFilter.query.split(" ").map((s) => ({
                                              name: {
                                                  contains: s,
                                              },
                                          })),
                                      },
                                  },
                              },
                          },
                      ],

                      tags: parsedFilter.tags
                          ? { some: { id: { in: parsedFilter.tags } } }
                          : undefined,
                  }
                : {
                      person: {
                          id: parsedFilter.personId,

                          schoolId: parsedFilter.schoolId,

                          OR: parsedFilter.person
                              ? [
                                    {
                                        AND: parsedFilter.person
                                            ?.split(" ")
                                            .map((s) => ({ firstName: { contains: s } })),
                                    },
                                    {
                                        AND: parsedFilter.person
                                            ?.split(" ")
                                            .map((s) => ({ lastName: { contains: s } })),
                                    },
                                    {
                                        AND: parsedFilter.person
                                            ?.split(" ")
                                            .map((s) => ({ nickname: { contains: s } })),
                                    },
                                ]
                              : undefined,
                      },
                      items: {
                          some: {
                              itemId:
                                  parsedFilter.itemIds && parsedFilter.itemIds.length > 0
                                      ? {
                                            in: parsedFilter.itemIds,
                                        }
                                      : undefined,
                              status:
                                  statuses && statuses.length > 0
                                      ? {
                                            in: statuses,
                                        }
                                      : undefined,
                              AND:
                                  parsedFilter.items?.split(" ").map((s) => ({
                                      item: {
                                          name: {
                                              contains: s,
                                          },
                                      },
                                  })) ?? undefined,
                          },
                      },

                      tags: parsedFilter.tags
                          ? { some: { id: { in: parsedFilter.tags } } }
                          : undefined,
                  };

        const loans = await prisma.loan.findMany({
            where: filter,
            orderBy: order,
            take: limit,
            skip: offset,
            ...loanSimpleSelection,
        });

        const itemStatuses: string[][] = [];
        const loanStatuses: ItemStatusData[] = [];
        loans.map((loan, index) => {
            loanStatuses.push(getLoanStatus(loan.items.map((item) => item.status)));
        });

        return {
            data: loans.map((loan, index) => ({
                id: loan.id,
                person: {
                    id: loan.person.id,
                    schoolId: loan.person.schoolId ?? undefined,
                    firstName: loan.person.firstName,
                    lastName: loan.person.lastName,
                    nickname: loan.person.nickname ?? undefined,
                    role: loan.person.role
                        ? {
                              ...loan.person.role,
                              description: loan.person.role.description ?? undefined,
                          }
                        : undefined,
                    loansCount: loan.person.loans.length,
                    outstandingItemsCount: loan.person.loans.filter((p) =>
                        p.items.some((i) => i.dateReturned === null)
                    ).length,
                    tags: loan.person.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                } satisfies LoanData["person"],
                items: loan.items.map((item) => ({
                    ...item,
                    ...item.item,
                    dateReturned: item.dateReturned ?? undefined,
                    loanId: loan.id,
                    loans: undefined,
                    itemId: item.item.id,
                    description: item.item.description ?? undefined,
                    status: STATUS_OPTIONS.find((status) => status.id === item.status),
                    tags: item.item.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                    returnedBy: item.returnedBy
                        ? {
                              ...item.returnedBy,
                              nickname: item.returnedBy.nickname ?? undefined,
                              tags: item.returnedBy.tags.map((tag) => ({
                                  ...tag,
                                  description: tag.description ?? undefined,
                              })),
                          }
                        : undefined,
                })) satisfies LoanData["items"],
                tags: loan.tags.map((tag) => ({
                    ...tag,
                    description: tag.description ?? undefined,
                })) satisfies LoanData["tags"],
                dateLoaned: loan.createdDate,
                status: loanStatuses[index],
            })),
            totalCount: await prisma.loan.count({ where: filter }),
        };
    } catch (e) {
        return { error: handleError(e, `failed to get loans`) };
    }
};

export const getLoanById = async (id?: string): Promise<DataReturn<LoanData>> => {
    try {
        const loanId = z.coerce.number().int().min(0).parse(id);

        const loan = await prisma.loan.findUniqueOrThrow({
            where: {
                id: loanId,
            },
            ...loanAdvancedSelection,
        });

        // Get unique statuses
        const loanStatus = getLoanStatus(loan.items.map((item) => item.status));

        const dateAllReturned = loan.items
            .map((item) => item.dateReturned)
            .reduce((a, b) => {
                if (!a && !a && dayjs(b).isAfter(a)) {
                    return b;
                }

                return a;
            });

        return {
            data: {
                id: loan.id,
                person: {
                    id: loan.person.id,
                    schoolId: loan.person.schoolId ?? undefined,
                    firstName: loan.person.firstName,
                    lastName: loan.person.lastName,
                    nickname: loan.person.nickname ?? undefined,
                    role: loan.person.role
                        ? {
                              ...loan.person.role,
                              description: loan.person.role.description ?? undefined,
                          }
                        : undefined,
                    loansCount: loan.person.loans.length,
                    outstandingItemsCount: loan.person.loans.filter((p) =>
                        p.items.some((i) => i.dateReturned === null)
                    ).length,
                    lostItemsCount: loan.person.loans.filter((p) =>
                        p.items.some((i) => i.status === "lost")
                    ).length,
                    tags: loan.person.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                } satisfies LoanData["person"],
                items: loan.items.map((item) => ({
                    ...item,
                    ...item.item,
                    dateReturned: item.dateReturned ?? undefined,
                    loanId: loan.id,
                    loans: undefined,
                    itemId: item.item.id,
                    outstandingLoansCount: item.item.loans.filter((l) => l.dateReturned === null)
                        .length,
                    uuid: item.item.uuid ?? undefined,
                    description: item.item.description ?? undefined,
                    status: STATUS_OPTIONS.find((status) => status.id === item.status),
                    tags: item.item.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                    returnedBy: item.returnedBy
                        ? {
                              ...item.returnedBy,
                              nickname: item.returnedBy.nickname ?? undefined,
                              tags: item.returnedBy.tags.map((tag) => ({
                                  ...tag,
                                  description: tag.description ?? undefined,
                              })),
                          }
                        : undefined,
                })) satisfies LoanData["items"],
                dateLoaned: loan.createdDate,
                tags: loan.tags.map((tag) => ({
                    ...tag,
                    description: tag.description ?? undefined,
                })) satisfies LoanData["tags"],
                status: loanStatus,
                itemsCount: loan.items.length,
                returnedItemsCount: loan.items.filter((i) => i.dateReturned !== null).length,
                outstandingItemsCount: loan.items.filter((i) => i.dateReturned === null).length,
                notes: loan.notes ?? undefined,
                dateReturned: dateAllReturned ?? undefined,
                dateCreated: loan.createdDate,
                dateUpdated: loan.updatedDate,
            },
        };
    } catch (e) {
        return { error: handleError(e, `with loan id ${id}`) };
    }
};

export const getLastLoan = async (
    personId?: string | number,
    itemId?: string | number
): Promise<DataReturn<LastLoanData>> => {
    try {
        const personIdParsed = z.coerce.number().int().min(0).optional().parse(personId);
        const itemIdParsed = z.coerce.number().int().min(0).optional().parse(itemId);

        const loan = await prisma.loan.findFirstOrThrow({
            where: {
                personId: personIdParsed,
                items: {
                    some: {
                        itemId: itemIdParsed,
                    },
                },
            },
            orderBy: {
                createdDate: "desc",
            },
            ...loanAdvancedSelection,
        });

        if (!loan) {
            return { error: "No loan found" };
        }

        // Get unique statuses
        const loanStatus = getLoanStatus(loan.items.map((item) => item.status));

        const dateAllReturned = loan.items
            .map((item) => item.dateReturned)
            .reduce((a, b) => {
                if (!a && !a && dayjs(b).isAfter(a)) {
                    return b;
                }

                return a;
            });

        return {
            data: {
                id: loan.id,
                status: loanStatus,
                dateAllReturned: dateAllReturned ?? undefined,
                dateLoaned: loan.createdDate,
                items: loan.items.map((item) => ({
                    ...item,
                    ...item.item,
                    dateReturned: item.dateReturned ?? undefined,
                    loanId: loan.id,
                    loans: undefined,
                    itemId: item.item.id,
                    description: item.item.description ?? undefined,
                    status: STATUS_OPTIONS.find((status) => status.id === item.status),
                    tags: item.item.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                    returnedBy: item.returnedBy
                        ? {
                              ...item.returnedBy,
                              nickname: item.returnedBy.nickname ?? undefined,
                              tags: item.returnedBy.tags.map((tag) => ({
                                  ...tag,
                                  description: tag.description ?? undefined,
                              })),
                          }
                        : undefined,
                })) satisfies LastLoanData["items"],
                person: {
                    ...loan.person,
                    loans: undefined,
                    schoolId: loan.person.schoolId ?? undefined,
                    nickname: loan.person.nickname ?? undefined,
                    loansCount: loan.person.loans.length,
                    outstandingItemsCount: loan.person.loans.filter((p) =>
                        p.items.some((i) => i.dateReturned === null)
                    ).length,
                    tags: loan.person.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                } satisfies LastLoanData["person"],
                tags: loan.tags.map((tag) => ({
                    ...tag,
                    description: tag.description ?? undefined,
                })) satisfies LastLoanData["tags"],
            },
        };
    } catch (e) {
        return { error: handleError(e, `with person id ${personId} and item id ${itemId}`) };
    }
};

export const createLoan = async (data: LoanFormType): Promise<DataReturn<LoanData>> => {
    try {
        if (dayjs(data.createdDate).isAfter() || data.createdDate === undefined) {
            data.createdDate = new Date();
        }

        data.createdDate = dayjs(data.createdDate).set("second", 0).set("millisecond", 0).toDate();

        const loan = LoanFormSchema.parse(data);

        const loanedItems = await prisma.loanedItem.findMany({
            where: {
                AND: [
                    {
                        itemId: {
                            in: loan.items.map((item) => item.itemId),
                        },
                    },
                    {
                        OR: [
                            {
                                dateReturned: null,
                            },
                            {
                                status: {
                                    in: [...INVALID_STATUS_IDS, "out"],
                                },
                            },
                        ],
                    },
                ],
            },
            ...loanSimpleSelection.select.items,
        });

        if (loanedItems.length > 0) {
            return { error: "One or more items are not available for loan" };
        }

        const lastLoan = loanedItems[0];

        if (lastLoan && dayjs(lastLoan.dateReturned).isSameOrAfter(loan.createdDate)) {
            return {
                error: "One or more items were previously loaned after the specified loan date",
            };
        }

        const createdLoan = await prisma.loan.create({
            data: {
                items: {
                    createMany: {
                        data: loan.items.map((item) => ({
                            itemId: item.itemId,
                            dateLoaned: loan.createdDate,
                            createdDate: loan.createdDate,
                            updatedDate: loan.createdDate,
                        })),
                    },
                },
                createdDate: loan.createdDate,
                updatedDate: loan.createdDate,
                notes: loan.notes,
                person: {
                    connect: {
                        id: loan.person.id,
                    },
                },
                tags: loan.tags
                    ? {
                          connect: loan.tags?.map((tag) => ({ id: tag.id })),
                      }
                    : undefined,
            },
            ...loanSimpleSelection,
        });

        return {
            data: {
                ...createdLoan,
                person: {
                    id: createdLoan.person.id,
                    schoolId: createdLoan.person.schoolId ?? undefined,
                    firstName: createdLoan.person.firstName,
                    lastName: createdLoan.person.lastName,
                    nickname: createdLoan.person.nickname ?? undefined,
                    role: createdLoan.person.role
                        ? {
                              ...createdLoan.person.role,
                              description: createdLoan.person.role.description ?? undefined,
                          }
                        : undefined,
                    loansCount: createdLoan.person.loans.length,
                    outstandingItemsCount: createdLoan.person.loans.filter((p) =>
                        p.items.some((i) => i.dateReturned === null)
                    ).length,
                    tags: createdLoan.person.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                } satisfies LoanData["person"],
                items: createdLoan.items.map((item) => ({
                    ...item,
                    ...item.item,
                    loanId: createdLoan.id,
                    loans: undefined,
                    itemId: item.item.id,
                    dateReturned: undefined,
                    description: item.item.description ?? undefined,
                    status: STATUS_OPTIONS.find((status) => status.id === "outstanding"),
                    tags: item.item.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                    returnedBy: undefined,
                })) satisfies LoanData["items"],
                dateLoaned: createdLoan.createdDate,
                tags: createdLoan.tags.map((tag) => ({
                    ...tag,
                    description: tag.description ?? undefined,
                })) satisfies LoanData["tags"],
                status: LOAN_STATUSES["outstanding"],
            },
        };
    } catch (e) {
        return { error: handleError(e, `with loan data ${data}`) };
    }
};

export const updateLoan = async (
    id?: string,
    data?: LoanFormType
): Promise<DataReturn<LoanData>> => {
    try {
        const loanId = z.coerce.number().int().min(0).parse(id);
        const loan = LoanFormSchema.partial().parse(data);

        if (loan.items && loan.items.some((item) => dayjs(item.dateReturned).isSameOrAfter())) {
            return { error: "One or more items have a return date in the future" };
        }

        const currentLoan = await prisma.loan.findUniqueOrThrow({
            where: {
                id: loanId,
            },
            include: {
                items: true,
            },
        });

        if (
            loan.items &&
            currentLoan.items.some((item) => {
                const newItem = loan.items!.find((i) => i.itemId === item.itemId);
                if (!newItem) return false;
                return dayjs(newItem.dateReturned).isSameOrBefore(item.dateLoaned);
            })
        ) {
            return { error: "One or more items were loaned before the specified loan return date" };
        }

        const updatedLoan = await prisma.loan.update({
            where: {
                id: loanId,
            },
            data: {
                items: loan.items
                    ? {
                          updateMany: loan.items.map((item) => ({
                              where: {
                                  itemId: item.itemId,
                              },
                              data: {
                                  itemId: item.newItemId,
                                  returnedById: item.returnedById,
                                  dateReturned: item.dateReturned,
                                  status: item.status,
                              },
                          })),
                      }
                    : undefined,
                person: loan.person
                    ? {
                          connect: {
                              id: loan.person.id,
                          },
                      }
                    : undefined,
                notes: loan.notes,
                tags: {
                    set: loan.tags?.map((tag) => ({ id: tag.id })),
                },
            },
            ...loanSimpleSelection,
        });

        const loanStatus = getLoanStatus(updatedLoan.items.map((item) => item.status));

        return {
            data: {
                ...updatedLoan,
                person: {
                    id: updatedLoan.person.id,
                    schoolId: updatedLoan.person.schoolId ?? undefined,
                    firstName: updatedLoan.person.firstName,
                    lastName: updatedLoan.person.lastName,
                    nickname: updatedLoan.person.nickname ?? undefined,
                    role: updatedLoan.person.role
                        ? {
                              ...updatedLoan.person.role,
                              description: updatedLoan.person.role.description ?? undefined,
                          }
                        : undefined,
                    loansCount: updatedLoan.person.loans.length,
                    outstandingItemsCount: updatedLoan.person.loans.filter((p) =>
                        p.items.some((i) => i.dateReturned === null)
                    ).length,
                    tags: updatedLoan.person.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                } satisfies LoanData["person"],
                items: updatedLoan.items.map((item) => ({
                    ...item,
                    ...item.item,
                    dateReturned: item.dateReturned ?? undefined,
                    loanId: updatedLoan.id,
                    loans: undefined,
                    itemId: item.item.id,
                    description: item.item.description ?? undefined,
                    status: STATUS_OPTIONS.find((status) => status.id === item.status),
                    tags: item.item.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                    returnedBy: item.returnedBy
                        ? {
                              ...item.returnedBy,
                              nickname: item.returnedBy.nickname ?? undefined,
                              tags: item.returnedBy.tags.map((tag) => ({
                                  ...tag,
                                  description: tag.description ?? undefined,
                              })),
                          }
                        : undefined,
                })) satisfies LoanData["items"],
                dateLoaned: updatedLoan.createdDate,
                tags: updatedLoan.tags.map((tag) => ({
                    ...tag,
                    description: tag.description ?? undefined,
                })) satisfies LoanData["tags"],
                status: loanStatus,
            },
        };
    } catch (e) {
        return { error: handleError(e, `with loan data ${data}`) };
    }
};

export const deleteLoan = async (id?: string): Promise<DataReturn<LoanData>> => {
    try {
        const loanId = z.coerce.number().int().min(0).parse(id);

        const deletedLoan = await prisma.loan.delete({
            where: {
                id: loanId,
            },
            ...loanSimpleSelection,
        });

        const loanStatus = getLoanStatus(deletedLoan.items.map((item) => item.status));

        return {
            data: {
                ...deletedLoan,
                person: {
                    id: deletedLoan.person.id,
                    schoolId: deletedLoan.person.schoolId ?? undefined,
                    firstName: deletedLoan.person.firstName,
                    lastName: deletedLoan.person.lastName,
                    nickname: deletedLoan.person.nickname ?? undefined,
                    role: deletedLoan.person.role
                        ? {
                              ...deletedLoan.person.role,
                              description: deletedLoan.person.role.description ?? undefined,
                          }
                        : undefined,
                    loansCount: deletedLoan.person.loans.length,
                    outstandingItemsCount: deletedLoan.person.loans.filter((p) =>
                        p.items.some((i) => i.dateReturned === null)
                    ).length,
                    tags: deletedLoan.person.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                } satisfies LoanData["person"],
                items: deletedLoan.items.map((item) => ({
                    ...item,
                    ...item.item,
                    dateReturned: item.dateReturned ?? undefined,
                    loanId: deletedLoan.id,
                    loans: undefined,
                    itemId: item.item.id,
                    description: item.item.description ?? undefined,
                    status: STATUS_OPTIONS.find((status) => status.id === item.status),
                    tags: item.item.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                    returnedBy: item.returnedBy
                        ? {
                              ...item.returnedBy,
                              nickname: item.returnedBy.nickname ?? undefined,
                              tags: item.returnedBy.tags.map((tag) => ({
                                  ...tag,
                                  description: tag.description ?? undefined,
                              })),
                          }
                        : undefined,
                })) satisfies LoanData["items"],
                dateLoaned: deletedLoan.createdDate,
                tags: deletedLoan.tags.map((tag) => ({
                    ...tag,
                    description: tag.description ?? undefined,
                })) satisfies LoanData["tags"],
                status: loanStatus,
            },
        };
    } catch (e) {
        return { error: handleError(e, `with loan Id ${id}`) };
    }
};

export const deleteLoans = async (data: { loanIds: string[] }): Promise<DataReturn<number>> => {
    try {
        const loanIds = z.array(z.coerce.number().int().min(0)).parse(data.loanIds);

        const deletedLoans = await prisma.loan.deleteMany({
            where: {
                id: {
                    in: loanIds,
                },
            },
        });

        return { data: deletedLoans.count };
    } catch (e) {
        return { error: handleError(e, `with loan Ids ${data.loanIds}`) };
    }
};
//#endregion

export const getTotalOutstandingLoans = async (): Promise<DataReturn<number>> => {
    try {
        const total = await prisma.loan.count({
            where: {
                items: {
                    some: {
                        dateReturned: null,
                    },
                },
            },
        });

        return { data: total };
    } catch (e) {
        return { error: handleError(e) };
    }
};

//#region Loaned Items
export const getLoanedItems = async (
    loanId?: string | number,
    itemId?: string | number
): Promise<DataReturn<LoanedItemData[]>> => {
    try {
        const loanIdParsed = z.coerce.number().int().min(0).optional().parse(loanId);
        const itemIdParsed = z.coerce.number().int().min(0).optional().parse(itemId);

        const loanedItems = await prisma.loanedItem.findMany({
            where: {
                loanId: loanIdParsed,
                itemId: itemIdParsed,
            },
            include: {
                item: {
                    include: {
                        tags: true,
                        type: true,
                        location: true,
                    },
                },
                returnedBy: {
                    include: {
                        role: true,
                        tags: true,
                    },
                },
            },
        });

        return {
            data: loanedItems.map((item) => ({
                ...item,
                ...item.item,
                dateReturned: item.dateReturned ?? undefined,
                loanId: item.loanId,
                loans: undefined,
                itemId: item.item.id,
                notes: item.item.notes ?? undefined,
                description: item.item.description ?? undefined,
                status: STATUS_OPTIONS.find((status) => status.id === item.status),
                tags: item.item.tags.map((tag) => ({
                    ...tag,
                    description: tag.description ?? undefined,
                })),
                dateLoaned: item.dateLoaned,
                returnDate: item.dateReturned ?? undefined,
                returnedBy: item.returnedBy
                    ? {
                          ...item.returnedBy,
                          nickname: item.returnedBy.nickname ?? undefined,
                      }
                    : undefined,
            })),
        };
    } catch (e) {
        return { error: handleError(e, `with loan id ${loanId}`) };
    }
};

export const getLoanedItemById = async (
    loanId?: string | number,
    itemId?: string | number,
    sortOrder: "asc" | "desc" = "desc"
): Promise<DataReturn<LoanedItemData>> => {
    try {
        const loanIdParsed = z.coerce.number().int().min(0).optional().parse(loanId);
        const itemIdParsed = z.coerce.number().int().min(0).optional().parse(itemId);

        if (loanIdParsed === undefined && itemIdParsed === undefined) {
            throw new Error("Must include at least 1 ID");
        }

        const loanedItem = await prisma.loanedItem.findFirstOrThrow({
            where: {
                loanId: loanIdParsed,
                itemId: itemIdParsed,
            },
            include: {
                item: {
                    include: {
                        tags: true,
                        type: true,
                        location: true,
                    },
                },
                loan: {
                    include: {
                        person: {
                            include: {
                                role: true,
                                tags: true,
                            },
                        },
                    },
                },
                returnedBy: {
                    include: {
                        role: true,
                        tags: true,
                    },
                },
            },
            orderBy: {
                dateLoaned: sortOrder,
            },
        });

        return {
            data: {
                ...loanedItem,
                ...loanedItem.item,
                loans: undefined,
                notes: loanedItem.item.notes ?? undefined,
                description: loanedItem.item.description ?? undefined,
                status: STATUS_OPTIONS.find((status) => status.id === loanedItem.status),
                person: {
                    ...loanedItem.loan.person,
                    loans: undefined,
                    schoolId: loanedItem.loan.person.schoolId ?? undefined,
                    nickname: loanedItem.loan.person.nickname ?? undefined,
                    tags: loanedItem.loan.person.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                } satisfies LoanedItemData["person"],
                tags: loanedItem.item.tags.map((tag) => ({
                    ...tag,
                    description: tag.description ?? undefined,
                })) satisfies LoanedItemData["tags"],
                dateLoaned: loanedItem.dateLoaned,
                dateReturned: loanedItem.dateReturned ?? undefined,
                returnedBy: loanedItem.returnedBy
                    ? ({
                          ...loanedItem.returnedBy,
                          nickname: loanedItem.returnedBy.nickname ?? undefined,
                      } satisfies LoanedItemData["returnedBy"])
                    : undefined,
            },
        };
    } catch (e) {
        return { error: handleError(e, `with loan id ${loanId} and item id ${itemId}`) };
    }
};
//#endregion

//#region Loan Grouping
export const groupLoansByMonth = async (): Promise<
    DataReturn<
        {
            month: string;
            totalLoans: number;
            totalReturns: number;
            days: { loanCount: number; returnCount: number }[];
        }[]
    >
> => {
    try {
        const allLoans = await prisma.loan.findMany({
            include: { person: true, items: true, tags: true },
        });

        let loansByMonth: {
            month: string;
            totalLoans: number;
            totalReturns: number;
            days: { loanCount: number; returnCount: number }[];
        }[] = [];

        allLoans.forEach((loan) => {
            const month = dayjs(loan.createdDate).format("MM-YYYY");
            const day = Number(dayjs(loan.createdDate).format("DD")) - 1;

            const existingMonth = loansByMonth.find((m) => m.month === month);

            if (existingMonth) {
                existingMonth.days[day].loanCount += 1;
                existingMonth.totalLoans += 1;
            } else {
                const days: {
                    loanCount: number;
                    returnCount: number;
                }[] = [];

                for (let i = 0; i < dayjs(month, "MM-YYYY").daysInMonth(); i++) {
                    days[i] = { loanCount: 0, returnCount: 0 };
                }

                days[day].loanCount = 1;

                loansByMonth.push({
                    month: month,
                    totalLoans: 1,
                    totalReturns: 0,
                    days: days,
                });
            }
        });

        allLoans
            .filter((loan) => loan.items.filter((item) => !item.dateReturned).length === 0)
            .forEach((loan) => {
                const month = dayjs(loan.createdDate).format("MM-YYYY");
                const day = Number(dayjs(loan.createdDate).format("DD")) - 1;

                const existingMonth = loansByMonth.find((m) => m.month === month);

                if (existingMonth) {
                    existingMonth.days[day].returnCount += 1;
                    existingMonth.totalReturns += 1;
                } else {
                    const days: {
                        loanCount: number;
                        returnCount: number;
                    }[] = [];

                    for (let i = 0; i < dayjs(month, "MM-YYYY").daysInMonth(); i++) {
                        days[i] = { loanCount: 0, returnCount: 0 };
                    }

                    days[day].returnCount = 1;

                    loansByMonth.push({
                        month: month,
                        totalLoans: 0,
                        totalReturns: 1,
                        days: days,
                    });
                }
            });

        loansByMonth = loansByMonth.sort((a, b) =>
            dayjs(a.month, "MM-YYYY").isAfter(dayjs(b.month, "MM-YYYY")) ? 1 : -1
        );

        return { data: loansByMonth };
    } catch (e) {
        return { error: handleError(e, "Failed to group loans by month") };
    }
};

export const groupLoansByYear = async (): Promise<
    DataReturn<
        {
            date: string;
            totalLoans: number;
            totalReturns: number;
        }[]
    >
> => {
    try {
        const yearBeforeDate = dayjs().subtract(1, "year");

        const loansInYear = await prisma.loan.findMany({
            include: { person: true, items: true, tags: true },
            where: {
                createdDate: {
                    gte: yearBeforeDate.toDate(),
                },
            },
        });

        let loansByYear: {
            date: string;
            totalLoans: number;
            totalReturns: number;
        }[] = [];

        loansInYear.forEach((loan) => {
            const date = dayjs(loan.createdDate).format("YYYY-MM-DD");

            const existingDate = loansByYear.find((d) => d.date === date);

            if (existingDate) {
                existingDate.totalLoans += 1;
            } else {
                loansByYear.push({
                    date: date,
                    totalLoans: 1,
                    totalReturns: 0,
                });
            }
        });

        loansInYear
            .filter((loan) => loan.items.filter((item) => !item.dateReturned).length === 0)
            .forEach((loan) => {
                const date = dayjs(loan.createdDate).format("YYYY-MM-DD");

                const existingDate = loansByYear.find((d) => d.date === date);

                if (existingDate) {
                    existingDate.totalReturns += 1;
                } else {
                    loansByYear.push({
                        date: date,
                        totalLoans: 0,
                        totalReturns: 1,
                    });
                }
            });

        // Fill in any gaps in days for loansByYear
        const endDate = dayjs(dayjs().format("YYYY-MM-DD"));
        let currentDate = yearBeforeDate;

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
            const dateStr = currentDate.format("YYYY-MM-DD");
            if (!loansByYear.find((d) => d.date === dateStr)) {
                loansByYear.push({
                    date: dateStr,
                    totalLoans: 0,
                    totalReturns: 0,
                });
            }
            currentDate = currentDate.add(1, "day");
        }

        // Sort loansByYear by date
        loansByYear.sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1));

        return { data: loansByYear, totalCount: loansByYear.length };
    } catch (e) {
        return { error: handleError(e, "Failed to group loans by year") };
    }
};
//#endregion
