import { Prisma } from "@prisma/client";

//#region POST Types

export type PostLoanFormData = {
  person: { id: number };
  items: { id: number }[];
  tags: { id: number }[];
};

export type PostPersonFormData = {
  firstName: string;
  lastName: string;
  nickname?: string;
  qrCode?: string;
  role?: { id: number };
};

export type PostItemFormData = {
  name: string;
  qrCode?: string;
  description?: string;
  location: { id: number };
  tags: { id: number }[];
};

export type PostTagFormData = {
  name: string;
  color: string;
  category: string;
  priority?: number;
  hidden?: boolean;
};

//#endregion

//#region PATCH Types
//#endregion

//#region Database Types

export const loanWithTags = Prisma.validator<Prisma.LoanDefaultArgs>()({
  include: {
    person: {
      include: {
        tags: true,
      },
    },
    tags: true,
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

export type LoanWithTags = Prisma.LoanGetPayload<typeof loanWithTags>;

export const loanWithTagsAndItems = Prisma.validator<Prisma.LoanDefaultArgs>()({
  include: {
    ...loanWithTags.include,
    items: {
      select: {
        item: {
          select: {
            id: true,
            qrCode: true,
            name: true,
          },
        },
      },
    },
  },
});

export type LoanWithTagsAndItems = Prisma.LoanGetPayload<
  typeof loanWithTagsAndItems
>;

export const personWithTags = Prisma.validator<Prisma.PersonDefaultArgs>()({
  include: {
    tags: true,
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

export type PersonWithTags = Prisma.PersonGetPayload<typeof personWithTags>;

export const itemWithTags = Prisma.validator<Prisma.ItemDefaultArgs>()({
  include: {
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

export type ItemWithTags = Prisma.ItemGetPayload<typeof itemWithTags>;

//#endregion
