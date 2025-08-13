import { Badge, BadgeProps, Group, GroupProps } from "@mantine/core";
import { TagData } from "~/utils/types.server";
import { filterTags } from "~/utils/utils";

export interface TagGroupProps {
    tags?: TagData[];
    categories?: string[];
    blacklist?: boolean;
    limit?: number;
    badgeProps?: BadgeProps;
    groupProps?: GroupProps;
}

export default function TagGroup({
    tags,
    categories = [],
    blacklist = false,
    limit = tags?.length ?? 0,
    badgeProps,
    groupProps,
}: TagGroupProps) {
    if (!tags) {
        return undefined;
    }

    const filteredTags = filterTags(tags, categories, blacklist);

    return filteredTags.length > 0 ? (
        <Group justify="end" align="center" gap={2} {...groupProps}>
            {filteredTags.slice(0, limit).map((t) => (
                <Badge key={t.id} color={t.color} autoContrast {...badgeProps}>
                    {t.name}
                </Badge>
            ))}
        </Group>
    ) : undefined;
}
