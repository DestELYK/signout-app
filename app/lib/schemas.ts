import { z } from "zod";

export const PersonFormSchema = z.object({
    firstName: z
        .string()
        .regex(/^[a-z0-9-\s]+$/i, "Name contains invalid characters")
        .min(1, "Name is required"),
    lastName: z
        .string()
        .regex(/^[a-z0-9-\s]+$/i, "Name contains invalid characters")
        .min(1, "Name is required"),
    nickname: z
        .string()
        .regex(/^[a-z0-9-\s]+$/i, "Name contains invalid characters")
        .min(1)
        .optional(),
    role: z.coerce.number({ message: "Role is required" }).min(0, "Role is required"),
    notes: z.string().max(500).optional(),
    studentId: z.string().optional(),
    tags: z.array(z.coerce.number()).optional(),
});

export type PersonFormType = z.infer<typeof PersonFormSchema>;

export const TagFormSchema = z.object({
    name: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-\s]+$/i, "Name contains invalid characters"),
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