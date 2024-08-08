import { Prisma } from "@prisma/client";
import { ROLE_ORDER } from "~/utils/consts";
import { PersonWithTags, personWithTags } from "~/utils/types.server";
import { isNumeric } from "~/utils/utils";
import { prisma } from "./prisma.server";

export const getPeople = async (
    filters: {
        query?: string;
        studentId?: string;
        firstName?: string;
        lastName?: string;
        nickname?: string;
        roles?: string[];
        outstanding?: boolean;
    },
    limit?: number,
    offset?: number
): Promise<{
    people?: PersonWithTags[];
    totalCount?: number;
    error?: string;
}> => {
    filters.firstName = filters.firstName?.trim().toLocaleLowerCase();
    filters.lastName = filters.lastName?.trim().toLocaleLowerCase();
    filters.nickname = filters.nickname?.trim().toLocaleLowerCase();
    filters.query = filters.query?.trim().toLocaleLowerCase();
    filters.studentId = filters.studentId?.trim().toLocaleLowerCase();
    filters.roles = filters.roles?.map((r) => r.trim().toLocaleLowerCase());

    if (limit && limit <= 0) limit = undefined;

    console.log(filters);

    try {
        const filter: Prisma.PersonWhereInput =
            filters.query && filters.query.length > 0
                ? {
                      loans:
                          filters.outstanding !== undefined
                              ? filters.outstanding
                                  ? {
                                        some: {
                                            items: {
                                                some: {
                                                    dateReturned: null,
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
                      OR: [
                          {
                              firstName: {
                                  contains: filters.query,
                              },
                          },
                          {
                              lastName: {
                                  contains: filters.query,
                              },
                          },
                          {
                              nickname: {
                                  contains: filters.query,
                              },
                          },
                          {
                              AND: {
                                  OR: [
                                      { firstName: { contains: filters.query.split(" ", 2)[0] } },
                                      { nickname: { contains: filters.query.split(" ", 2)[0] } },
                                  ],
                                  lastName: { contains: filters.query.split(" ", 2)[1] },
                              },
                          },
                          {
                              studentId: filters.query,
                          },
                      ],
                  }
                : filters.studentId
                ? {
                      studentId: filters.studentId,
                  }
                : {
                      loans:
                          filters.outstanding !== undefined
                              ? filters.outstanding
                                  ? {
                                        some: {
                                            items: {
                                                some: {
                                                    dateReturned: null,
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
                      firstName: filters.firstName
                          ? {
                                contains: filters.firstName,
                            }
                          : undefined,
                      lastName: filters.lastName
                          ? {
                                contains: filters.lastName,
                            }
                          : undefined,
                      nickname: filters.nickname
                          ? {
                                contains: filters.nickname,
                            }
                          : undefined,
                      role:
                          filters.roles && filters.roles.length > 0
                              ? {
                                    OR: filters.roles.map((role) => ({
                                        name: role,
                                    })),
                                }
                              : undefined,
                  };

        const people = await prisma.person.findMany({
            where: filter,
            include: personWithTags.include,
            orderBy: {
                id: "desc",
            },
            take: limit,
            skip: offset,
        });

        return {
            people: people,
            totalCount: await prisma.person.count({ where: filter }),
        };
    } catch (e) {
        console.error(`Failed to get people`, e);

        let message = "Unknown Error";
        if (e instanceof Error) message = e.message;

        return { error: message };
    }
};

export const getPersonById = async (id: string): Promise<{ person?: PersonWithTags; error?: string }> => {
    try {
        if (!isNumeric(id)) throw new Error("Invalid ID");

        const person = await prisma.person.findUnique({
            where: {
                id: Number(id),
            },
            include: personWithTags.include,
        });

        if (!person) throw new Error("Person not found");

        return { person: person };
    } catch (e) {
        console.error(`Failed to get person by id`, e);

        let message = "Unknown Error";
        if (e instanceof Error) message = e.message;

        return { error: message };
    }
};

export const getPeopleRoleCounts = async (): Promise<{
    roleCounts?: {
        role: string;
        loanCount: number;
        returnCount: number;
    }[];
    error?: string;
}> => {
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
            roleCounts: roleCounts,
        };
    } catch (e) {
        console.error(`Failed to get people role counts`, e);

        let message = "Unknown Error";
        if (e instanceof Error) message = e.message;

        return { error: message };
    }
};

export const getPeopleWithInvalidItems = async (): Promise<{
    peopleWithInvalidItems?: PersonWithTags[];
    error?: string;
}> => {
    try {
        const people = await prisma.person.findMany({
            where: {
                loans: {
                    some: {
                        items: {
                            some: {
                                AND: [
                                    {
                                        dateReturned: null,
                                    },
                                    {
                                        item: {
                                            tags: {
                                                some: {
                                                    category: "Item Status",
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            include: personWithTags.include,
        });

        return { peopleWithInvalidItems: people };
    } catch (e) {
        console.error(`Failed to get people with invalid items`, e);

        let message = "Unknown Error";
        if (e instanceof Error) message = e.message;

        return { error: message };
    }
};
