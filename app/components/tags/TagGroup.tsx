/**
 * TagGroup Component
 *
 * A specialized group component for displaying collections of tags
 * in the signout system. Provides filtering, limiting, and styling
 * capabilities for tag collections.
 *
 *
 * @module TagGroup
 *
 * @author Kyle Dunn
 */

import { Badge, BadgeProps, Group, GroupProps } from "@mantine/core";
import { TagData } from "~/utils/types.server";
import { filterTags } from "~/utils/utils";

/**
 * Props for the TagGroup component
 */
export interface TagGroupProps {
  /** Array of tags to display */
  tags?: TagData[];
  /** Categories to filter by */
  categories?: string[];
  /** Whether to use blacklist filtering (exclude categories) */
  blacklist?: boolean;
  /** Maximum number of tags to display */
  limit?: number;
  /** Additional props for Badge components */
  badgeProps?: BadgeProps;
  /** Additional props for Group component */
  groupProps?: GroupProps;
}

/**
 * A specialized group component for tag collection display
 * Handles tag filtering, limiting, and styling with flexible options
 *
 * @param props - The component props
 * @returns The rendered tag group component or undefined if no tags
 */
export default function TagGroup({
  tags,
  categories = [],
  blacklist = false,
  limit = tags?.length ?? 0,
  badgeProps,
  groupProps,
}: TagGroupProps) {
  // Early return if no tags are provided
  if (!tags) {
    return undefined;
  }

  // Filter tags based on categories and blacklist settings
  const filteredTags = filterTags(tags, categories, blacklist);

  return filteredTags.length > 0 ? (
    <Group justify="end" align="center" gap={2} {...groupProps}>
      {/* Render tags up to the specified limit */}
      {filteredTags.slice(0, limit).map((t) => (
        <Badge key={t.id} color={t.color} autoContrast {...badgeProps}>
          {t.name}
        </Badge>
      ))}
    </Group>
  ) : undefined;
}
