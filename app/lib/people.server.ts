import { Prisma, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { z } from "zod";
import { DEFAULT_ROLES, ROLE_ORDER, STATUS_OPTIONS } from "~/utils/consts";
import {
    DataReturn,
    InvalidItemData,
    loanSimpleSelection,
    personAdvancedSelection,
    PersonData,
    PersonRoleData,
    personRoleSelection,
    personSimpleSelection,
} from "~/utils/types.server";
import { getLoanStatus } from "~/utils/utils";
import { handleError } from "./db.server";
import {
    PersonFormSchema,
    PersonFormType,
    PersonQuerySchema,
    PersonQueryType,
    PersonRoleSchema,
    PersonRoleType,
    QuerySchema,
    QueryType,
} from "./schemas";

const prisma = new PrismaClient();

export const getPeople = async (
    filters: {
        [key in keyof PersonQueryType]: string | string[] | boolean | undefined;
    } = {},
    limit?: number,
    offset?: number
): Promise<DataReturn<PersonData[]>> => {
    if (limit && limit <= 0) limit = undefined;

    try {
        const parsedFilter = PersonQuerySchema.parse(filters);

        const filter: Prisma.PersonWhereInput = parsedFilter.schoolId
            ? {
                  schoolId: parsedFilter.schoolId,
              }
            : parsedFilter.query && parsedFilter.query.length > 0
            ? {
                  loans:
                      parsedFilter.outstanding !== undefined
                          ? parsedFilter.outstanding === true
                              ? {
                                    some: {
                                        items: {
                                            some: {
                                                OR: [
                                                    { dateReturned: null },
                                                    {
                                                        status: {
                                                            in: ["out", "lost"],
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                }
                              : {
                                    none: {
                                        items: {
                                            some: {
                                                dateReturned: null,
                                            },
                                        },
                                    },
                                }
                          : undefined,
                  OR: parsedFilter.query.split(" ").map((q) => ({
                      OR: [
                          {
                              firstName: {
                                  contains: q,
                              },
                          },
                          {
                              lastName: {
                                  contains: q,
                              },
                          },
                          {
                              nickname: {
                                  contains: q,
                              },
                          },
                      ],
                  })),

                  tags: parsedFilter.tags ? { some: { id: { in: parsedFilter.tags } } } : undefined,
              }
            : parsedFilter.personId
            ? {
                  id: parsedFilter.personId,

                  tags: parsedFilter.tags ? { some: { id: { in: parsedFilter.tags } } } : undefined,
              }
            : {
                  loans:
                      parsedFilter.outstanding !== undefined
                          ? parsedFilter.outstanding
                              ? {
                                    some: {
                                        items: {
                                            some: {
                                                OR: [
                                                    {
                                                        dateReturned: null,
                                                    },
                                                    {
                                                        status: {
                                                            in: ["out", "lost"],
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                }
                              : {
                                    none: {
                                        items: {
                                            some: {
                                                status: "out",
                                            },
                                        },
                                    },
                                }
                          : undefined,
                  firstName: parsedFilter.firstName
                      ? {
                            contains: parsedFilter.firstName,
                        }
                      : undefined,
                  lastName: parsedFilter.lastName
                      ? {
                            contains: parsedFilter.lastName,
                        }
                      : undefined,
                  nickname: parsedFilter.nickname
                      ? {
                            contains: parsedFilter.nickname,
                        }
                      : undefined,
                  role:
                      parsedFilter.roles && parsedFilter.roles.length > 0
                          ? {
                                OR: parsedFilter.roles.map((role) => ({
                                    id: role,
                                })),
                            }
                          : undefined,

                  tags: parsedFilter.tags ? { some: { id: { in: parsedFilter.tags } } } : undefined,
              };

        const people = await prisma.person.findMany({
            ...personSimpleSelection,
            where: filter,
            orderBy: {
                id: "desc",
            },
            take: limit,
            skip: offset,
        });

        return {
            data: people.map((person) => {
                let totalOutstandingItems = 0;
                person.loans.forEach((loan) => {
                    totalOutstandingItems += loan.items.filter((item) => !item.dateReturned).length;
                });

                let lostItemsCount = 0;
                person.loans.forEach((loan) => {
                    lostItemsCount += loan.items.filter((item) => item.status === "lost").length;
                });
                return {
                    id: person.id,
                    firstName: person.firstName,
                    lastName: person.lastName,
                    nickname: person.nickname ?? undefined,
                    personId: person.schoolId ?? undefined,
                    role: person.role,
                    tags: person.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                    outstandingItemsCount: totalOutstandingItems,
                    loansCount: person.loans.length,
                    lostItemsCount: lostItemsCount,
                    lostItems: person.loans.flatMap((loan) =>
                        loan.items
                            .filter((item) => item.status === "lost")
                            .map((item) => ({
                                id: item.item.id,
                                name: item.item.name,
                                dateLoaned: item.dateLoaned,
                                dateReturned: item.dateReturned ?? undefined,
                                status: STATUS_OPTIONS.find((status) => status.id === item.status),
                                loanData: {
                                    id: loan.id,
                                },
                            }))
                    ),
                };
            }),
            totalCount: await prisma.person.count({ where: filter }),
        };
    } catch (e) {
        return { error: handleError(e, "getting people") };
    }
};

export const getPersonById = async (id?: string): Promise<DataReturn<PersonData>> => {
    try {
        const personId = z.coerce.number({ message: "Invalid Person ID" }).parse(id);

        const person = await prisma.person.findUniqueOrThrow({
            ...personAdvancedSelection,
            where: {
                id: personId,
            },
        });

        let averageReturnTime = 0;
        person.loans.forEach((loan) => {
            loan.items.forEach((li) => {
                if (li.dateReturned) {
                    averageReturnTime += li.dateReturned.getTime() - li.dateLoaned.getTime();
                }
            });
        });

        const lastLoan =
            person.loans.length === 0
                ? undefined
                : (await prisma.loan.findFirst({
                      where: {
                          personId: person.id,
                      },
                      orderBy: {
                          createdDate: "desc",
                      },
                      ...loanSimpleSelection,
                  })) ?? undefined;

        const lostItems: InvalidItemData[] = person.loans.flatMap((loan) => {
            const items = loan.items.filter((item) => item.status === "lost");

            return items.map((item) => ({
                id: item.item.id,
                name: item.item.name,
                dateLoaned: item.dateLoaned,
                dateReturned: item.dateReturned ?? undefined,
                status: STATUS_OPTIONS.find((status) => status.id === item.status),
                loanData: {
                    id: loan.id,
                },
            }));
        });

        return {
            data: {
                id: person.id,
                firstName: person.firstName,
                lastName: person.lastName,
                nickname: person.nickname ?? undefined,
                schoolId: person.schoolId ?? undefined,
                role: person.role,
                tags: person.tags.map((tag) => ({
                    ...tag,
                    description: tag.description ?? undefined,
                })) satisfies PersonData["tags"],
                lostItemsCount: lostItems.length,
                loansCount: person.loans.length,
                outstandingItemsCount: person.loans.filter((loan) =>
                    loan.items.some((item) => !item.dateReturned)
                ).length,
                createdDate: person.createdDate,
                updatedDate: person.updatedDate,
                averageReturnTime: averageReturnTime,
                totalReturnedItemsCount: person.returnedItems.length,
                totalItemsNotReturnedCount: person.loans.reduce(
                    (acc, loan) => acc + loan.items.filter((item) => !item.dateReturned).length,
                    0
                ),
                lastLoan:
                    lastLoan &&
                    ({
                        id: lastLoan.id,
                        tags: lastLoan.tags.map((tag) => ({
                            ...tag,
                            description: tag.description ?? undefined,
                        })),
                        dateAllReturned:
                            lastLoan.items
                                .map((i) => i.dateReturned)
                                .reduce((acc, date) => {
                                    if (date && acc && dayjs(date).isAfter(acc)) {
                                        return date;
                                    }
                                    return acc;
                                }) ?? undefined,
                        dateLoaned: lastLoan.createdDate,
                        status: getLoanStatus(lastLoan.items.map((item) => item.status)),
                        items: lastLoan.items.map((i) => ({
                            id: i.item.id,
                            uuid: i.item.uuid,
                            name: i.item.name,
                            status: STATUS_OPTIONS.find((status) => status.id === i.status),
                            returnDate: i.dateReturned ?? undefined,
                            returnedBy: i.returnedBy
                                ? {
                                      id: i.returnedBy.id,
                                      firstName: i.returnedBy.firstName,
                                      lastName: i.returnedBy.lastName,
                                      nickname: i.returnedBy.nickname ?? undefined,
                                  }
                                : undefined,
                        })),
                    } satisfies PersonData["lastLoan"]),
                loans: person.loans.map((loan) => ({
                    id: loan.id,
                    dateLoaned: loan.createdDate,
                    status: getLoanStatus(loan.items.map((item) => item.status)),
                    person: {
                        id: loan.person.id,
                        firstName: loan.person.firstName,
                        lastName: loan.person.lastName,
                        nickname: loan.person.nickname ?? undefined,
                    },
                    itemsCount: loan.items.length,
                    items: loan.items.map((item) => ({
                        itemId: item.item.id,
                        loanId: loan.id,
                        name: item.item.name,
                        uuid: item.item.uuid,
                        status: STATUS_OPTIONS.find((status) => status.id === item.status),
                    })),
                })) satisfies PersonData["loans"],
                lostItems: lostItems,
                totalItemsCount: person.loans.reduce((acc, loan) => acc + loan.items.length, 0),
                notes: person.notes,
                returnedItems: person.returnedItems.map((item) => ({
                    ...item,
                    ...item.item,
                    dateReturned: item.dateReturned!,
                })) satisfies PersonData["returnedItems"],
            },
        };
    } catch (e) {
        return { error: handleError(e, "getting person") };
    }
};

export const getPersonRoleCount = async (): Promise<
    DataReturn<
        {
            role: string;
            loanCount: number;
            returnCount: number;
        }[]
    >
> => {
    try {
        const roleLoans = await prisma.personRole.findMany({
            select: {
                name: true,
                people: { select: { id: true } },
            },
        });

        let roleCounts: {
            role: string;
            loanCount: number;
            returnCount: number;
        }[] = [];

        for (let i = 0; i < roleLoans.length; i++) {
            const role = roleLoans[i];

            const loans = await prisma.loan.findMany({
                where: { personId: { in: role.people.map((person) => person.id) } },
                include: { items: true },
            });

            const existingRole = roleCounts.find((r) => r.role === role.name);

            if (existingRole) {
                existingRole.loanCount = loans.length;
                existingRole.returnCount = loans.filter((loan) =>
                    loan.items.some((item) => item.dateReturned)
                ).length;
            } else {
                roleCounts.push({
                    role: role.name,
                    loanCount: loans.length,
                    returnCount: loans.filter((loan) =>
                        loan.items.some((item) => item.dateReturned)
                    ).length,
                });
            }
        }

        roleCounts = roleCounts.sort(
            (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
        );

        return {
            data: roleCounts,
        };
    } catch (e) {
        return { error: handleError(e, "getting role counts") };
    }
};

export const getPeopleWithInvalidItems = async (): Promise<DataReturn<PersonData[]>> => {
    try {
        const invalidItemFilter: Prisma.LoanWhereInput = {
            items: {
                some: {
                    status: "lost",
                },
            },
        };

        const people = await prisma.person.findMany({
            select: {
                ...personSimpleSelection.select,
                loans: {
                    where: {
                        ...invalidItemFilter,
                    },
                    select: {
                        id: true,
                        person: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                nickname: true,
                            },
                        },
                        items: {
                            select: {
                                item: {
                                    select: {
                                        id: true,
                                        name: true,
                                        uuid: true,
                                    },
                                },
                                status: true,
                                dateLoaned: true,
                                dateReturned: true,
                            },
                        },
                    },
                },
            },
            where: {
                loans: {
                    some: {
                        ...invalidItemFilter,
                    },
                },
            },
        });

        return {
            data: people.map((person) => {
                let totalOutstandingItems = 0;
                person.loans.forEach((loan) => {
                    totalOutstandingItems += loan.items.filter((item) => !item.dateReturned).length;
                });

                let lostItemsCount = 0;
                person.loans.forEach((loan) => {
                    lostItemsCount += loan.items.filter((item) => item.status === "lost").length;
                });
                return {
                    id: person.id,
                    firstName: person.firstName,
                    lastName: person.lastName,
                    nickname: person.nickname ?? undefined,
                    personId: person.schoolId ?? undefined,
                    role: person.role,
                    tags: person.tags.map((tag) => ({
                        ...tag,
                        description: tag.description ?? undefined,
                    })),
                    outstandingItemsCount: totalOutstandingItems,
                    loansCount: person.loans.length,
                    lostItemsCount: lostItemsCount,

                    lostItems: person.loans.flatMap((loan) =>
                        loan.items
                            .filter((item) => item.status === "lost")
                            .map((item) => ({
                                id: item.item.id,
                                name: item.item.name,
                                dateLoaned: item.dateLoaned,
                                dateReturned: item.dateReturned ?? undefined,
                                status: STATUS_OPTIONS.find((status) => status.id === item.status),
                                loanData: {
                                    id: loan.id,
                                },
                            }))
                    ),
                };
            }),
            totalCount: people.length,
        };
    } catch (e) {
        return { error: handleError(e, "getting people with invalid items") };
    }
};

export const createPerson = async (data: PersonFormType): Promise<DataReturn<PersonData>> => {
    try {
        const person = PersonFormSchema.parse(data);

        const createdPerson = await prisma.person.create({
            data: {
                schoolId: person.schoolId,
                firstName: person.firstName,
                lastName: person.lastName,
                nickname: person.nickname,
                roleId: person.role.id,
                notes: person.notes,
                tags: person.tags && {
                    connect: person.tags.map((tag) => ({ id: tag.id })),
                },
            },
            ...personSimpleSelection,
        });

        return {
            data: {
                id: createdPerson.id,
                firstName: createdPerson.firstName,
                lastName: createdPerson.lastName,
                nickname: createdPerson.nickname ?? undefined,
                schoolId: createdPerson.schoolId ?? undefined,
                role: createdPerson.role,
                tags: createdPerson.tags.map((tag) => ({
                    ...tag,
                    description: tag.description ?? undefined,
                })),
            },
        };
    } catch (e) {
        return { error: handleError(e, "creating person") };
    }
};

export const updatePerson = async (
    personId?: string,
    data?: PersonFormType
): Promise<DataReturn<PersonData>> => {
    try {
        const id = z.coerce.number({ message: "Invalid Person ID" }).parse(personId);

        if (data?.schoolId?.length === 0) {
            data.schoolId = null;
        }

        if (data?.nickname?.length === 0) {
            data.nickname = undefined;
        }

        const person = PersonFormSchema.partial().parse(data);

        const updatedPerson = await prisma.person.update({
            where: {
                id: id,
            },
            data: {
                schoolId: person.schoolId,
                firstName: person.firstName,
                lastName: person.lastName,
                nickname: person.nickname,
                role: person.role
                    ? {
                          connect: {
                              id: person.role.id,
                          },
                      }
                    : undefined,
                tags: person.tags && {
                    set: person.tags.map((tag) => ({ id: tag.id })),
                },
                notes: person.notes,
            },
            ...personSimpleSelection,
        });

        return {
            data: {
                id: updatedPerson.id,
                firstName: updatedPerson.firstName,
                lastName: updatedPerson.lastName,
                nickname: updatedPerson.nickname ?? undefined,
                schoolId: updatedPerson.schoolId ?? undefined,
                role: updatedPerson.role,
                tags: updatedPerson.tags.map((tag) => ({
                    ...tag,
                    description: tag.description ?? undefined,
                })),
            },
        };
    } catch (e) {
        return { error: handleError(e, "updating person") };
    }
};

export const updatePeople = async (data?: {
    peopleIds: string[];
    roleId: number;
}): Promise<DataReturn<number>> => {
    try {
        const parsedPeople = z
            .object({
                peopleIds: z.array(z.coerce.number().int().min(0)),
                roleId: z.number().int().min(0).optional(),
            })
            .parse(data);

        const updatePeople = await prisma.person.updateMany({
            where: {
                id: {
                    in: parsedPeople.peopleIds,
                },
            },
            data: {
                roleId: parsedPeople.roleId,
            },
        });

        return { data: updatePeople.count };
    } catch (e) {
        return { error: handleError(e, "updating people") };
    }
};

export const deletePerson = async (personId?: string): Promise<DataReturn<PersonData>> => {
    try {
        const id = z.coerce.number({ message: "Invalid Person ID" }).parse(personId);

        const result = await prisma.person.delete({
            where: {
                id: id,
            },
            ...personSimpleSelection,
        });

        return {
            data: {
                id: result.id,
                firstName: result.firstName,
                lastName: result.lastName,
                nickname: result.nickname ?? undefined,
                schoolId: result.schoolId ?? undefined,
                role: result.role,
                tags: result.tags.map((tag) => ({
                    ...tag,
                    description: tag.description ?? undefined,
                })),
            },
        };
    } catch (e) {
        return { error: handleError(e, "deleting person") };
    }
};

export const deletePeople = async (data: { peopleIds: string[] }): Promise<DataReturn<number>> => {
    try {
        const peopleIds = z.array(z.coerce.number().int().min(0)).parse(data.peopleIds);

        const deletePeople = await prisma.person.deleteMany({
            where: {
                id: {
                    in: peopleIds,
                },
            },
        });

        return { data: deletePeople.count };
    } catch (e) {
        return { error: handleError(e, `with people Ids ${data.peopleIds}`) };
    }
};
//#endregion

//#region Person Role
export const getPersonRoles = async (
    filters: {
        [key in keyof QueryType]: string | string[] | undefined;
    } = {}
): Promise<DataReturn<PersonRoleData[]>> => {
    try {
        const parsedFilter = QuerySchema.parse(filters);

        const roles = await prisma.personRole.findMany({
            where: parsedFilter.query
                ? {
                      AND: parsedFilter.query.split(" ").map((q) => ({
                          name: {
                              contains: q,
                          },
                      })),
                  }
                : undefined,
            ...personRoleSelection,
        });

        return {
            data: roles.sort((a, b) => ROLE_ORDER.indexOf(a.name) - ROLE_ORDER.indexOf(b.name)),
        };
    } catch (e) {
        return { error: handleError(e, "getting person roles") };
    }
};

export const getPersonRoleById = async (roleId: string): Promise<DataReturn<PersonRoleData>> => {
    try {
        const id = z.coerce.number({ message: "Invalid Role ID" }).parse(roleId);

        const role = await prisma.personRole.findUniqueOrThrow({
            where: {
                id: id,
            },
            ...personRoleSelection,
        });

        return {
            data: role,
        };
    } catch (e) {
        return { error: handleError(e, "getting person role") };
    }
};

export const createPersonRole = async (
    data: PersonRoleType
): Promise<DataReturn<PersonRoleData>> => {
    try {
        const personRole = PersonRoleSchema.parse(data);

        const createdPersonRole = await prisma.personRole.create({
            data: {
                name: personRole.name,
                description: personRole.description,
                color: personRole.color,
            },
            ...personRoleSelection,
        });

        return {
            data: createdPersonRole,
        };
    } catch (e) {
        return { error: handleError(e, "creating person role") };
    }
};

export const updatePersonRole = async (
    roleId: string,
    data: PersonRoleType
): Promise<DataReturn<PersonRoleData>> => {
    try {
        const id = z.coerce.number({ message: "Invalid Role ID" }).parse(roleId);

        const personRole = PersonRoleSchema.parse(data);

        const role = await prisma.personRole.findUniqueOrThrow({
            where: {
                id: id,
            },
            ...personRoleSelection,
        });

        if (role.name !== personRole.name && DEFAULT_ROLES.find((r) => r.name === role.name)) {
            return { error: "Cannot modify default role names" };
        }

        const updatedPersonRole = await prisma.personRole.update({
            where: {
                id: id,
            },
            data: {
                name: personRole.name,
                description: personRole.description,
                color: personRole.color,
            },
            ...personRoleSelection,
        });

        return {
            data: updatedPersonRole,
        };
    } catch (e) {
        return { error: handleError(e, "updating person role") };
    }
};

export const deletePersonRole = async (roleId: string): Promise<DataReturn<PersonRoleData>> => {
    try {
        const id = z.coerce.number({ message: "Invalid Role ID" }).parse(roleId);

        const role = await prisma.personRole.findUniqueOrThrow({
            where: {
                id: id,
            },
            ...personRoleSelection,
        });

        if (DEFAULT_ROLES.find((r) => r.name === role.name) !== undefined) {
            return { error: "Cannot delete default roles" };
        }

        const result = await prisma.personRole.delete({
            where: {
                id: id,
            },
        });

        return {
            data: result,
        };
    } catch (e) {
        return { error: handleError(e, "deleting person role") };
    }
};
//#endregion
