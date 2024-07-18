import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import {
  LoanWithTagsAndItems,
  loanWithTagsAndItems,
} from "~/utils/types.server";
import { isNumeric } from "~/utils/utils";
import { prisma } from "./prisma.server";

export const getLoans = async (
  filters: {
    query?: string;
    status?: "outstanding" | "returned";
    person?: string;
    items?: string;
  },
  limit?: number,
  offset?: number
): Promise<{
  loans?: LoanWithTagsAndItems[];
  totalCount?: number;
  error?: string;
}> => {
  try {
    filters.query = filters.query?.trim().toLocaleLowerCase();
    filters.person = filters.person?.trim().toLocaleLowerCase();
    filters.items = filters.items?.trim().toLocaleLowerCase();
    filters.status = filters.status?.trim().toLocaleLowerCase() as
      | "outstanding"
      | "returned"
      | undefined;

    if (limit && limit <= 0) limit = undefined;

    const filter: Prisma.LoanWhereInput =
      filters.query && filters.query.length > 0
        ? {
            ...(filters.status === "outstanding"
              ? { items: { some: { dateReturned: null } } }
              : filters.status === "returned" && {
                  items: { none: { dateReturned: null } },
                }),
            OR: [
              {
                person: {
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
                          {
                            firstName: {
                              contains: filters.query.split(" ", 2)[0],
                            },
                          },
                          {
                            nickname: {
                              contains: filters.query.split(" ", 2)[0],
                            },
                          },
                        ],
                        lastName: { contains: filters.query.split(" ", 2)[1] },
                      },
                    },
                  ],
                },
              },
              {
                items: {
                  some: {
                    item: {
                      AND: filters.query.split(" ").map((s) => ({
                        name: {
                          contains: s,
                        },
                      })),
                    },
                  },
                },
              },
            ],
          }
        : {
            person: filters.person
              ? {
                  OR: [
                    {
                      firstName: {
                        contains: filters.person,
                      },
                    },
                    {
                      lastName: {
                        contains: filters.person,
                      },
                    },
                    {
                      nickname: {
                        contains: filters.person,
                      },
                    },
                    {
                      AND: {
                        OR: [
                          {
                            firstName: {
                              contains: filters.person.split(" ", 2)[0],
                            },
                          },
                          {
                            nickname: {
                              contains: filters.person.split(" ", 2)[0],
                            },
                          },
                        ],
                        lastName: { contains: filters.person.split(" ", 2)[1] },
                      },
                    },
                  ],
                }
              : undefined,
            items:
              filters.status || filters.items
                ? {
                    some: {
                      item: filters.items
                        ? {
                            AND: filters.items.split(" ").map((s) => ({
                              name: {
                                contains: s,
                              },
                            })),
                          }
                        : undefined,
                      dateReturned:
                        filters.status === "outstanding"
                          ? null
                          : filters.status === "returned"
                          ? { not: null }
                          : undefined,
                    },
                  }
                : undefined,
          };

    const loans = await prisma.loan.findMany({
      where: filter,
      include: loanWithTagsAndItems.include,
      orderBy: {
        id: "desc",
      },
      take: limit,
      skip: offset,
    });

    return {
      loans: loans,
      totalCount: await prisma.loan.count({ where: filter }),
    };
  } catch (e) {
    console.error(`Failed to get loans`, e);

    let message = "Unknown Error";
    if (e instanceof Error) message = e.message;

    return { error: message };
  }
};

export const getLoanById = async (
  id: string
): Promise<{ loan?: LoanWithTagsAndItems; error?: string }> => {
  try {
    if (!isNumeric(id)) throw new Error("Invalid ID");

    const loan = await prisma.loan.findUnique({
      where: {
        id: Number(id),
      },
      include: loanWithTagsAndItems.include,
    });

    if (!loan) throw new Error("Loan not found");

    return { loan: loan };
  } catch (e) {
    console.error(`Failed to get loan by id`, e);

    let message = "Unknown Error";
    if (e instanceof Error) message = e.message;

    return { error: message };
  }
};

export const getLoanByMonth = async (
  month?: string | null
): Promise<{
  loansByMonth?: {
    month: string;
    totalLoans: number;
    totalReturns: number;
    days: { loanCount: number; returnCount: number }[];
  }[];
  error?: string;
}> => {
  try {
    if (month && !isNumeric(month)) throw new Error("Invalid Month");

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
      .filter(
        (loan) => loan.items.filter((item) => !item.dateReturned).length === 0
      )
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

    return { loansByMonth: loansByMonth };
  } catch (e) {
    console.error(`Failed to get loans by month`, e);

    let message = "Unknown Error";
    if (e instanceof Error) message = e.message;

    return { error: message };
  }
};

export const getLoansByYear = async (): Promise<{
  loansByYear?: {
    date: string;
    totalLoans: number;
    totalReturns: number;
  }[];
  error?: string;
}> => {
  try {
    const loansInYear = await prisma.loan.findMany({
      include: { person: true, items: true, tags: true },
      where: {
        createdDate: {
          gte: dayjs().subtract(1, "year").toDate(),
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
      .filter(
        (loan) => loan.items.filter((item) => !item.dateReturned).length === 0
      )
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

    return { loansByYear: loansByYear };
  } catch (e) {
    console.error(`Failed to get loans by year`, e);

    let message = "Unknown Error";
    if (e instanceof Error) message = e.message;

    return { error: message };
  }
};