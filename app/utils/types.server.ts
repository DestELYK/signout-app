import { Prisma } from "@prisma/client";

export const itemFindMany = Prisma.validator<Prisma.ItemDefaultArgs>()({
  select: {
    id: true,
    qrCode: true,
    name: true,
    description: true,
    tags: {
      select: {
        name: true,
        color: true,
      },
    },
    createdDate: true,
    updatedDate: true,
    _count: {
      select: {
        loans: { where: { dateReturned: null } },
      },
    },
  },
});
export type ItemFindMany = Prisma.ItemGetPayload<typeof itemFindMany>;

export const itemFindOne = Prisma.validator<Prisma.ItemDefaultArgs>()({
  include: {
    loans: {
      include: {
        loan: {
          include: {
            person: {
              include: {
                role: true,
              },
            },
            tags: true,
          },
        },
        returnedBy: {
          include: {
            role: true,
          },
        },
      },
    },
    tags: true,
    _count: {
      select: {
        loans: {
          where: {
            dateReturned: null,
          },
        },
      },
    },
  },
});

export type ItemFindOne = Prisma.ItemGetPayload<typeof itemFindOne>;

export const personFindMany = Prisma.validator<Prisma.PersonDefaultArgs>()({
  select: {
    id: true,
    qrCode: true,
    firstName: true,
    lastName: true,
    nickname: true,
    role: {
      select: {
        name: true,
        color: true,
      },
    },
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
        returnedItems: true,
      },
    },
  },
});

export type PersonFindMany = Prisma.PersonGetPayload<typeof personFindMany>;

export const personFindOne = Prisma.validator<Prisma.PersonDefaultArgs>()({
  include: {
    role: true,
    loans: {
      include: {
        items: {
          include: {
            item: {
              include: {
                tags: true,
              },
            },
          },
        },
        tags: true,
      },
    },
    returnedItems: {
      include: {
        item: true,
      },
    },
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
  },
});

export type PersonFindOne = Prisma.PersonGetPayload<typeof personFindOne>;

export const loanedItemInclude =
  Prisma.validator<Prisma.LoanedItemDefaultArgs>()({
    include: {
      item: {
        include: {
          tags: true,
        },
      },
      returnedBy: {
        include: {
          role: true,
        },
      },
    },
  });

export type LoanedItemInclude = Prisma.LoanedItemGetPayload<
  typeof loanedItemInclude
>;

export const loanFindMany = Prisma.validator<Prisma.LoanDefaultArgs>()({
  select: {
    id: true,
    person: {
      select: {
        id: true,
        qrCode: true,
        firstName: true,
        lastName: true,
        nickname: true,
        role: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    },
    items: {
      select: {
        dateLoaned: true,
        dateReturned: true,
        item: {
          select: {
            id: true,
            name: true,
            qrCode: true,
          },
        },
      },
    },
    tags: {
      select: {
        name: true,
        color: true,
      },
    },
    createdDate: true,
    updatedDate: true,
    _count: {
      select: {
        items: {
          where: {
            dateReturned: null,
          },
        },
      },
    },
  },
});
export type LoanFindMany = Prisma.LoanGetPayload<typeof loanFindMany>;

export const loanFindOne = Prisma.validator<Prisma.LoanDefaultArgs>()({
  include: {
    person: {
      include: {
        role: true
      }
    },
    items: loanedItemInclude,
    tags: true,
  },
});

export type LoanFindOne = Prisma.LoanGetPayload<typeof loanFindOne>;
