import { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import { TagData } from "~/utils/types.server";
import { handleError } from "./db.server";
import { TagFormSchema, TagFormType, TagQueryType } from "./schemas";

const prisma = new PrismaClient();

export const getTags = async (
    filters: TagQueryType,
    limit?: number,
    offset?: number
): Promise<{
    tags?: TagData[];
    totalCount?: number;
    error?: string;
}> => {
    try {
        const filter = {
            AND: [
                filters.query
                    ? {
                          OR: [
                              {
                                  name: {
                                      contains: filters.query,
                                  },
                              },
                              {
                                  category: {
                                      contains: filters.query,
                                  },
                              },
                          ],
                      }
                    : {},
                filters.category
                    ? {
                          category: filters.category,
                      }
                    : {},
                filters.hidden !== undefined
                    ? {
                          hidden: filters.hidden,
                      }
                    : {},
            ],
        } satisfies Prisma.TagWhereInput;

        const result = await prisma.tag.findMany({
            where: filter,
            orderBy: {
                priority: "desc",
            },
            take: limit,
            skip: offset,
        });

        return {
            tags: result.map((tag) => ({
                ...tag,
                description: tag.description ?? undefined,
            })),
            totalCount: await prisma.tag.count({ where: filter }),
        };
    } catch (e) {
        return { error: handleError(e, "getting tags") };
    }
};

export const getTagById = async (
    tagId: string
): Promise<{
    tag?: TagData;
    error?: string;
}> => {
    try {
        const id = z.coerce.number({ message: "Invalid Tag ID" }).parse(tagId);

        const result = await prisma.tag.findUniqueOrThrow({
            where: {
                id: id,
            },
        });

        return {
            tag: {
                ...result,
                description: result.description ?? undefined,
            },
        };
    } catch (e) {
        return { error: handleError(e, "getting tag by ID") };
    }
};

export const createTag = async (
    data: TagFormType
): Promise<{
    tag?: TagData;
    error?: string;
}> => {
    try {
        const newTag = TagFormSchema.parse(data);

        const result = await prisma.tag.create({
            data: {
                name: newTag.name,
                category: newTag.category,
                color: newTag.color,
                priority: newTag.priority,
                hidden: newTag.hidden,
            },
        });

        return {
            tag: {
                ...result,
                description: result.description ?? undefined,
            },
        };
    } catch (e) {
        return { error: handleError(e, "creating tag") };
    }
};

export const updateTag = async (
    tagId: string,
    data: TagFormType
): Promise<{
    tag?: TagData;
    error?: string;
}> => {
    try {
        const id = z.coerce.number({ message: "Invalid tag ID" }).parse(tagId);

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

        return {
            tag: {
                ...result,
                description: result.description ?? undefined,
            },
        };
    } catch (e) {
        return { error: handleError(e, "updating tag") };
    }
};

export const deleteTag = async (
    tagId: string
): Promise<{
    tag?: TagData;
    error?: string;
}> => {
    try {
        const id = z.coerce.number().parse(tagId);

        const result = await prisma.tag.delete({
            where: {
                id: id,
            },
        });

        return {
            tag: {
                ...result,
                description: result.description ?? undefined,
            },
        };
    } catch (e) {
        return { error: handleError(e, "deleting tag") };
    }
};
