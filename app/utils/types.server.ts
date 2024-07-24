import { Prisma, Tag } from "@prisma/client";

//#region POST Types

export type PostLoanFormData = {
  person: { id: number };
  items: { id: number }[];
  tags: { id: number }[];
  dateLoaned?: string;
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

export interface PatchLoanFormData {
  personId?: number;
  itemIds?: { id: number; newId?: number; returnedById?: number }[];
  tagIds?: { id: number; name?: string }[];
  notes?: string;
  dateReturned?: string;
}

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
        dateLoaned: true,
        dateReturned: true,
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
    loans: {
      select: {
        id: true,
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

export type PersonWithTags = Prisma.PersonGetPayload<typeof personWithTags>;

export const itemWithTags = Prisma.validator<Prisma.ItemDefaultArgs>()({
  include: {
    tags: true,
    loans: {
      select: {
        loanId: true,
      },
    },
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

export interface LastLoanData {
  id: number;
  person: {
    id: number;
    qrCode?: string | null;
    firstName: string;
    lastName: string;
    nickname?: string | null;
    tags: Tag[];
  };
  items?: {
    id: number;
    name: string;
    dateReturned?: Date | null;
    returnedBy?: {
      id: number;
      firstName: string;
      lastName: string;
      nickname?: string | null;
    } | null;
  }[];
  dateLoaned: Date;
  dateReturned?: Date | null;
  tags: Tag[];
}
