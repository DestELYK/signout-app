/**
 * TagPreview Component
 *
 * A preview component that displays how a tag will appear within a
 * group context. Shows example tags along with the preview tag to
 * demonstrate visual hierarchy and appearance.
 *
 *
 * @module TagPreview
 *
 * @author Kyle Dunn
 */

import { EXAMPLE_TAGS } from "~/utils/consts";
import { TagData } from "~/utils/types.server";
import InfoView, { InfoViewProps } from "../base/InfoView";
import TagGroup from "./TagGroup";

/**
 * Props for the TagPreview component
 */
export interface TagPreviewProps {
  /** The tag to preview */
  tag: TagData;
  /** Additional props for the preview container */
  previewProps?: InfoViewProps["cardProps"];
}

/**
 * A preview component for displaying tag appearance in context
 * Shows how a tag will look alongside other tags with proper styling
 *
 * @param props - The component props
 * @returns The rendered tag preview component
 */
export default function TagPreview({ tag, previewProps }: TagPreviewProps) {
  // Create a preview context with example tags and the preview tag
  const tags: TagData[] = [
    ...EXAMPLE_TAGS.filter((t) => (tag.hidden ? true : t.priority !== tag.priority)),
    { ...tag, description: "Preview Tag" },
  ];

  return (
    <InfoView title="Tag Preview" cardProps={previewProps}>
      <TagGroup groupProps={{ justify: "center" }} tags={tags} />
    </InfoView>
  );
}
