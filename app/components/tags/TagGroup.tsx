import { Badge, BadgeProps, Group, GroupProps } from "@mantine/core";
import { Tag } from "@prisma/client";
import { filterTags } from "~/utils/utils";

export interface TagGroupProps {
  tags: Tag[];
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
  limit = tags.length,
  badgeProps,
  groupProps,
}: TagGroupProps) {
  const filteredTags = filterTags(tags, categories, blacklist);

  return filteredTags.length > 0 ? (
    <Group {...groupProps}>
      {filteredTags.slice(0, limit).map((t) => (
        <Badge key={t.id} color={t.color} autoContrast {...badgeProps}>
          {t.name}
        </Badge>
      ))}
    </Group>
  ) : undefined;
}
