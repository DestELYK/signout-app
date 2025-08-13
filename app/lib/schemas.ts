import { z } from "zod";

export const QuerySchema = z.object({
    query: z
        .string()
        .regex(/^[a-zA-Z0-9-_ ]+$|^$/)
        .nullish(),
});
export type QueryType = z.infer<typeof QuerySchema>;

//#region Tag Schemas

export const TagQuerySchema = QuerySchema.extend({
    category: z.string().optional(),
    hidden: z.boolean().optional(),
});
export type TagQueryType = z.infer<typeof TagQuerySchema>;

export const TagFormSchema = z.object({
    name: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-\s]+$/i, "Name contains invalid characters"),
    description: z.string().max(50).optional(),
    category: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-\s]+$/i, "Category contains invalid characters"),
    color: z
        .string()
        .min(7)
        .max(7)
        .regex(/^#[0-9a-f]{6}$/i, "Color is not a valid hex code"),
    priority: z.number().int().min(-100).max(100),
    hidden: z.boolean(),
});
export type TagFormType = z.infer<typeof TagFormSchema>;
//#endregion

//#region Person Schemas
export const PersonQuerySchema = QuerySchema.extend({
    personId: z.coerce.number().int().min(0).optional(),
    schoolId: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    nickname: z.string().optional(),
    roles: z.array(z.coerce.number().int().min(0)).optional(),
    outstanding: z.boolean().optional(),
    tags: z
        .array(z.coerce.number().int().min(0))
        .optional()
        .transform((v) => (v ? (v.length > 0 ? v : undefined) : undefined)),
});
export type PersonQueryType = z.infer<typeof PersonQuerySchema>;

export const PersonRoleSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    color: z
        .string()
        .min(7)
        .max(7)
        .regex(/^#[0-9a-f]{6}$/i),
});
export type PersonRoleType = z.infer<typeof PersonRoleSchema>;

export const PersonFormSchema = z.object({
    firstName: z
        .string()
        .regex(/^[a-z0-9\'-\s]+$/i, "Name contains invalid characters")
        .min(1, "Name is required"),
    lastName: z
        .string()
        .regex(/^[a-z0-9\'-\s]+$/i, "Name contains invalid characters")
        .min(1, "Name is required"),
    nickname: z
        .string()
        .regex(/^$|^[a-z0-9\'-\s]+$/i, "Nickname contains invalid characters")
        .min(0)
        .max(50, "Nickname is too long")
        .optional(),
    role: PersonRoleSchema.partial().extend({ id: z.coerce.number().int().min(0) }),
    notes: z.string().max(500).optional(),
    schoolId: z.string().nullish(),
    tags: z.array(TagFormSchema.extend({ id: z.coerce.number() })).optional(),
});
export type PersonFormType = z.infer<typeof PersonFormSchema>;
//#endregion

//#region Item Schemas
export const ItemQuerySchema = QuerySchema.extend({
    uuid: z.string().uuid().optional(),
    name: z
        .string()
        .regex(/^[a-z0-9-\s]+$/i, "Name contains invalid characters")
        .optional(),
    statuses: z.array(z.string()).optional(),
    types: z
        .array(z.string().min(3))
        .optional()
        .transform((v) => (v ? (v.length > 0 ? v : undefined) : undefined)),
    locations: z
        .array(z.string().min(3))
        .optional()
        .transform((v) => (v ? (v.length > 0 ? v : undefined) : undefined)),
    tags: z
        .array(z.coerce.number().int().min(0))
        .optional()
        .transform((v) => (v ? (v.length > 0 ? v : undefined) : undefined)),
    loans: z
        .array(z.coerce.number().int().min(0))
        .optional()
        .transform((v) => (v ? (v.length > 0 ? v : undefined) : undefined)),
    outstanding: z.boolean().optional(),
    sortBy: z.string().optional(),
    sortOrder: z
        .string()
        .optional()
        .transform((v) => (v === "asc" || v === "desc" ? v : undefined)),
    personId: z.coerce.number().int().min(0).optional(),
});
export type ItemQueryType = z.infer<typeof ItemQuerySchema>;

export const ItemTypeSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});
export type ItemTypeType = z.infer<typeof ItemTypeSchema>;

export const LocationSchema = z.object({
    name: z.string(),
});
export type LocationType = z.infer<typeof LocationSchema>;

export const ItemFormSchema = z.object({
    name: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-\s]+$/i, "Name contains invalid characters"),
    type: ItemTypeSchema.partial().extend({
        id: z.number({ message: "Item Type is Required" }).int().min(0),
    }),
    description: z.string().max(500).optional(),
    notes: z.string().max(500).optional(),
    location: LocationSchema.partial().extend({ id: z.number().int().min(0) }),
    status: z.string().min(3).optional(),
    tags: z.array(TagFormSchema.extend({ id: z.coerce.number() })).optional(),
});
export type ItemFormType = z.infer<typeof ItemFormSchema>;
//#endregion

export const LoanQuerySchema = QuerySchema.extend({
    personId: z.coerce.number().int().min(0).optional(),
    schoolId: z.string().optional(),
    itemIds: z.array(z.coerce.number().int().min(0)).optional(),
    statuses: z.array(z.string()).optional(),
    items: z.string().optional(),
    person: z.string().optional(),
    tags: z
        .array(z.coerce.number().int().min(0))
        .optional()
        .transform((v) => (v ? (v.length > 0 ? v : undefined) : undefined)),
});
export type LoanQueryType = z.infer<typeof LoanQuerySchema>;

export const LoanedItemSchema = z.object({
    loanId: z.coerce.number().int().min(0),
    itemId: z.coerce.number().int().min(0),
    status: z.string().min(3).default("returned").optional(),
    dateLoaned: z.coerce.date().optional(),
    dateReturned: z.coerce.date().nullish(),
    returnedById: z.number().int().min(0).nullish(),
});
export type LoanedItemType = z.infer<typeof LoanedItemSchema>;

export const LoanFormSchema = z.object({
    person: z.object(
        {
            id: z.coerce
                .number({ message: "Invalid person id provided" })
                .int("Invalid person id provided")
                .min(0, "Invalid person id provided"),
        },
        { message: "Person is required" }
    ),
    items: z
        .array(
            LoanedItemSchema.extend({
                newItemId: z.coerce.number().int().min(0).optional(),
            })
        )
        .min(1),
    notes: z.string().max(200).optional(),
    tags: z.array(TagFormSchema.extend({ id: z.coerce.number() })).optional(),
    createdDate: z.coerce.date().optional(),
});
export type LoanFormType = z.infer<typeof LoanFormSchema>;
