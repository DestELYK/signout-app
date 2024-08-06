import { z } from "zod";
import { prisma } from "./prisma.server";
import { TagFormSchema } from "./schemas";

export async function updateTag(tagId: string, data: z.infer<typeof TagFormSchema>) {
    try {
        const id = z.coerce.number().parse(tagId);

        const newTag = TagFormSchema.parse(data);

        const result = await prisma.tag.update({
            where: {
                id: id,
            },
            data: {
                name: newTag.name,
                category: newTag.category,
                color: newTag.color,
                priority: newTag.priority,
                hidden: newTag.hidden,
            },
        });

        return { tag: result };
    } catch (e) {
        console.error(`Failed to update tag`, e);

        let message = "Unknown Error";
        if (e instanceof Error) message = e.message;

        return { error: message };
    }
}

export async function deleteTag(tagId: string) {
    try {
        const id = z.coerce.number().parse(tagId);

        const result = await prisma.tag.delete({
            where: {
                id: id,
            },
        });

        return { tag: result };
    } catch (e) {
        console.error(`Failed to get person by id`, e);

        let message = "Unknown Error";
        if (e instanceof Error) message = e.message;

        return { error: message };
    }
}
