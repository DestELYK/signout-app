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

import { Badge, BadgeProps, Group, GroupProps, UnstyledButton } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
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
  /** Whether tags should be clickable (default: false) */
  clickable?: boolean;
  /** The route type to navigate to when a tag is clicked */
  redirectRoute?: "items" | "loans" | "people" | "tag";
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
  clickable = false,
  redirectRoute = "tag",
}: TagGroupProps) {
  const navigate = useNavigate();

  // Early return if no tags are provided
  if (!tags) {
    return undefined;
  }

  // Filter tags based on categories and blacklist settings
  const filteredTags = filterTags(tags, categories, blacklist);

  const handleTagClick = (tag: TagData) => {
    if (!clickable) return;

    if (redirectRoute === "tag") {
      navigate(`/tags/${tag.id}`);
    } else {
      const baseUrl = `/${redirectRoute}/list`;
      const tagParam = `tag=${encodeURIComponent(tag.id)}`;
      navigate(`${baseUrl}?${tagParam}`);
    }
  };

  const renderTag = (tag: TagData) => {
    const badge = (
      <Badge key={tag.id} color={tag.color} autoContrast {...badgeProps}>
        {tag.name}
      </Badge>
    );

    if (!clickable) {
      return badge;
    }

    return (
      <UnstyledButton
        key={tag.id}
        onClick={() => handleTagClick(tag)}
        onMouseEnter={(e) => {
          const badge = e.currentTarget.querySelector("[data-badge]") as HTMLElement;
          if (badge) badge.style.opacity = "0.8";
        }}
        onMouseLeave={(e) => {
          const badge = e.currentTarget.querySelector("[data-badge]") as HTMLElement;
          if (badge) badge.style.opacity = "1";
        }}
      >
        <Badge
          data-badge
          color={tag.color}
          autoContrast
          {...badgeProps}
          style={{
            ...badgeProps?.style,
            cursor: "pointer",
            transition: "opacity 0.2s ease",
          }}
        >
          {tag.name}
        </Badge>
      </UnstyledButton>
    );
  };

  return filteredTags.length > 0 ? (
    <Group justify="end" align="center" gap={2} {...groupProps}>
      {/* Render tags up to the specified limit */}
      {filteredTags.slice(0, limit).map(renderTag)}
    </Group>
  ) : undefined;
}
