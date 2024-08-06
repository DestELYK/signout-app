import { z } from "zod";

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
