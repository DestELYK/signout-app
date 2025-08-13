import { Prisma } from "@prisma/client";

//#region Tag
export const tagSelection = Prisma.validator<Prisma.TagDefaultArgs>()({
    select: {
        id: true,
        name: true,
        category: true,
        color: true,
        hidden: true,
        priority: true,
        description: true,
    },
});
//#endregion

//#region Location
export const locationSelection = Prisma.validator<Prisma.LocationDefaultArgs>()({
    select: {
        id: true,
        name: true,
    },
});
//#endregion

//#region ItemType
export const itemTypeSelection = Prisma.validator<Prisma.ItemTypeDefaultArgs>()({
    select: {
        id: true,
        name: true,
        description: true,
    },
});
//#endregion

//#region Item
export const itemSimpleSelection = Prisma.validator<Prisma.ItemDefaultArgs>()({
    select: {
        id: true,
        uuid: true,
        name: true,
        description: true,
        location: {
            select: locationSelection.select,
        },
        loans: {
            select: {
                loanId: true,
                status: true,
                dateReturned: true,
                loan: {
                    select: {
                        personId: true,
                    },
                },
            },
            orderBy: {
                dateLoaned: "desc",
            },
        },
        type: {
            select: itemTypeSelection.select,
        },
        tags: {
            select: tagSelection.select,
        },
        _count: {
            select: {
                loans: true,
            },
        },
    },
});

export const itemAdvancedSelection = Prisma.validator<Prisma.ItemDefaultArgs>()({
    select: {
        id: true,
        uuid: true,
        name: true,
        description: true,
        location: {
            select: locationSelection.select,
        },
        type: {
            select: itemTypeSelection.select,
        },
        tags: {
            select: tagSelection.select,
        },
        loans: {
            select: {
                dateLoaned: true,
                dateReturned: true,
                status: true,
                loan: {
                    select: {
                        id: true,
                        person: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                nickname: true,
                                role: {
                                    select: {
                                        id: true,
                                        name: true,
                                        color: true,
                                        description: true,
                                    },
                                },
                            },
                        },
                        _count: {
                            select: {
                                items: true,
                            },
                        },
                    },
                },
                returnedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        nickname: true,
                    },
                },
            },
            orderBy: {
                dateLoaned: "desc",
            },
        },
        createdDate: true,
        updatedDate: true,
        notes: true,
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
//#endregion

//#region PersonRole
export const personRoleSelection = Prisma.validator<Prisma.PersonRoleDefaultArgs>()({
    select: {
        id: true,
        name: true,
        description: true,
        color: true,
    },
});
//#endregion

//#region Person
export const personSimpleSelection = Prisma.validator<Prisma.PersonDefaultArgs>()({
    select: {
        id: true,
        schoolId: true,
        firstName: true,
        lastName: true,
        nickname: true,
        loans: {
            select: {
                id: true,
                items: {
                    select: {
                        dateLoaned: true,
                        dateReturned: true,
                        returnedById: true,
                        status: true,
                        item: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        },
        role: {
            select: personRoleSelection.select,
        },
        tags: {
            select: tagSelection.select,
        },
    },
});

export const personAdvancedSelection = Prisma.validator<Prisma.PersonDefaultArgs>()({
    select: {
        id: true,
        firstName: true,
        lastName: true,
        nickname: true,
        schoolId: true,
        loans: {
            select: {
                id: true,
                createdDate: true,
                person: {
                    ...personSimpleSelection,
                },
                items: {
                    select: {
                        item: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                uuid: true,
                            },
                        },
                        status: true,
                        dateLoaned: true,
                        dateReturned: true,
                    },
                    orderBy: {
                        dateLoaned: "desc",
                    },
                },
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
            orderBy: {
                createdDate: "desc",
            },
        },
        notes: true,
        createdDate: true,
        updatedDate: true,
        returnedItems: {
            where: {
                dateReturned: {
                    not: null,
                },
            },
            select: {
                item: {
                    select: {
                        id: true,
                        name: true,
                        uuid: true,
                    },
                },
                dateLoaned: true,
                dateReturned: true,
            },
        },
        role: {
            select: personRoleSelection.select,
        },
        tags: {
            select: tagSelection.select,
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
//#endregion

//#region Loan
export const loanSimpleSelection = Prisma.validator<Prisma.LoanDefaultArgs>()({
    select: {
        id: true,
        person: {
            select: personSimpleSelection.select,
        },
        items: {
            select: {
                item: {
                    select: itemSimpleSelection.select,
                },
                status: true,
                dateLoaned: true,
                dateReturned: true,
                returnedBy: personSimpleSelection,
            },
            orderBy: {
                dateLoaned: "desc",
            },
        },
        createdDate: true,
        tags: {
            select: tagSelection.select,
        },
    },
});

export const loanAdvancedSelection = Prisma.validator<Prisma.LoanDefaultArgs>()({
    select: {
        id: true,
        person: {
            select: personSimpleSelection.select,
        },
        items: {
            select: {
                item: {
                    select: itemSimpleSelection.select,
                },
                status: true,
                dateLoaned: true,
                dateReturned: true,
                returnedBy: personSimpleSelection,
            },
            orderBy: {
                dateLoaned: "desc",
            },
        },
        notes: true,
        createdDate: true,
        updatedDate: true,
        tags: {
            select: tagSelection.select,
        },
    },
});
//#endregion

//-------------- Data Types ----------------

export type TagData = {
    id: number;
    name: string;
    category: string;
    color: string;
    hidden: boolean;
    priority: number;
    description?: string;
};

export type PersonRoleData = {
    id: number;
    name: string;
    description?: string;
    color: string;
};

export type PersonData = {
    id: number;
    schoolId?: string;
    firstName: string;
    lastName: string;
    nickname?: string;
    notes?: string;
    role?: PersonRoleData;
    tags?: TagData[];
    loans?: Pick<LoanData, "id" | "items" | "itemsCount" | "dateLoaned" | "person" | "status">[];
    returnedItems?: {
        id: number;
        uuid: string;
        name: string;
        dateLoaned: Date;
        dateReturned: Date;
    }[];
    lostItems?: InvalidItemData[];
    averageReturnTime?: number;
    loansCount?: number;
    outstandingItemsCount?: number;
    lostItemsCount?: number;
    totalReturnedItemsCount?: number;
    totalItemsNotReturnedCount?: number;
    totalItemsCount?: number;
    lastLoan?: LastLoanData;
    createdDate?: Date;
    updatedDate?: Date;
};

export type LocationData = {
    id: number;
    name: string;
};

export type ItemTypeData = {
    id: number;
    name: string;
    description?: string;
};

export type ItemStatusData = {
    id: string;
    name: string;
    color: string;
};

export type ItemData = {
    id: number;
    name: string;
    uuid?: string;
    description?: string;
    notes?: string;
    location?: LocationData;
    status?: ItemStatusData;
    type?: ItemTypeData;
    tags?: TagData[];
    createdDate?: Date;
    updatedDate?: Date;
    lastLoan?: LastLoanData;
    loans?: {
        id: number;
        person?: Pick<PersonData, "id" | "firstName" | "lastName" | "nickname" | "role">;
        dateLoaned: Date;
        dateReturned?: Date;
        itemCount: number;
        status?: ItemStatusData;
    }[];
    outstandingLoansCount?: number;
    totalLoansCount?: number;
    uniquePeopleCount?: number;
    averageLoanTime?: number;
};

export type LoanedItemData = Omit<LastLoanData, "id" | "items" | "dateAllReturned"> &
    Omit<ItemData, "id" | "lastLoan"> & {
        loanId: number;
        itemId: number;
        dateReturned?: Date;
        returnedBy?: Pick<PersonData, "id" | "firstName" | "lastName" | "nickname">;
    };

export type InvalidItemData = Pick<ItemData, "id" | "name" | "status" | "type"> & {
    loanData?: Pick<LastLoanData, "id" | "dateLoaned" | "dateAllReturned"> & {
        person?: Pick<PersonData, "id" | "firstName" | "lastName" | "nickname">;
    };
};

export type ItemsByTypeData = {
    typeId: number;
    type: string;
    statusCount: {
        [key: string]: number;
    };
    total: number;
};

export type LastLoanData = {
    id: number;
    person?: PersonData;
    items?: (ItemData & {
        returnDate?: Date;
        returnedBy?: Pick<PersonData, "id" | "firstName" | "lastName" | "nickname">;
    })[];
    status?: ItemStatusData;
    dateLoaned?: Date;
    dateAllReturned?: Date;
    tags?: TagData[];
};

export type LoanData = {
    id: number;
    person: PersonData;
    status: ItemStatusData;
    items: LoanedItemData[];
    notes?: string;
    tags?: TagData[];
    dateLoaned: Date;
    dateReturned?: Date;
    returnedItemsCount?: number;
    outstandingItemsCount?: number;
    itemsCount?: number;
    dateCreated?: Date;
    dateUpdated?: Date;
};

export type DataReturn<T> = {
    data?: T;
    totalCount?: number;
    error?: string;
};
