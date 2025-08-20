/**
 * ComboView Component
 *
 * A display component that combines text highlighting,
 * captions, and tag groups in a consistent layout. Used throughout
 * the application for list items and search results.
 *
 *
 * @module ComboView
 *
 * @author Kyle Dunn
 */

import { Flex, Highlight, Stack, Text } from "@mantine/core";
import { TagData } from "~/utils/types.server";
import TagGroup from "./tags/TagGroup";

/**
 * Props for the ComboView component
 */
export interface ComboViewProps {
  /** Text or array of strings to highlight in the title */
  highlight: string | string[];
  /** Main title text to display */
  title: string;
  /** Optional caption/description text */
  caption?: string;
  /** Array of tags to display */
  tags?: TagData[];
  /** Filter to limit which tag categories to show */
  tagFilter?: string[];
  /** Optional content for the right side of the header */
  rightSection?: React.ReactNode;
}

/**
 * A versatile display component with highlighting and tag support
 * Used for consistent item display across lists and search results
 *
 * @param props - The component props
 * @returns The rendered combo view component
 */
export default function ComboView({
  title,
  caption,
  highlight,
  tags,
  tagFilter,
  rightSection,
}: ComboViewProps) {
  return (
    <Stack gap={2}>
      <Flex direction="row" wrap="nowrap" align="center" justify="space-between" gap="sm">
        <Highlight highlight={highlight}>{title}</Highlight>
        {rightSection}
      </Flex>
      {caption && (
        <Text size="xs" c="dimmed">
          {caption}
        </Text>
      )}
      <Flex direction="row" gap="sm" align="center" wrap="nowrap" justify="space-between">
        {tags && tags.length > 0 && (
          <TagGroup tags={tags} categories={tagFilter} badgeProps={{ size: "xs" }} />
        )}
      </Flex>
    </Stack>
  );
}
