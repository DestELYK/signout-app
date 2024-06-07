import { Prisma } from "@prisma/client";
import { PersonWithTags, personWithTags } from "~/utils/types.server";
import { isNumeric } from "~/utils/utils";
import { prisma } from "./prisma.server";

export const getPeople = async (
  filters: {
    query?: string;
    qrCode?: string;
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
            ],
          }
        : filters.qrCode
        ? {
            qrCode: filters.qrCode,
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
            tags:
              filters.roles && filters.roles.length > 0
                ? {
                    some: {
                      OR: filters.roles.map((role) => ({
                        category: "Person Role",
                        name: role,
                      })),
                    },
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

export const getPersonById = async (
  id: string
): Promise<{ person?: PersonWithTags; error?: string }> => {
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
