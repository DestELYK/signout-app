/**
 * ListSkeleton Component
 *
 * A loading skeleton component that displays placeholder elements
 * for list-based content. Provides visual feedback during data loading
 * states with configurable item count and spacing.
 *
 *
 * @module ListSkeleton
 *
 * @author Kyle Dunn
 */

import { MantineSpacing, Skeleton, Stack } from "@mantine/core";

/**
 * Props for the ListSkeleton component
 */
interface ListSkeletonProps {
  /** Number of skeleton items to display */
  itemCount: number;
  /** Height of each skeleton item */
  height: string | number;
  /** Gap spacing between skeleton items */
  gap?: MantineSpacing;
}

/**
 * A loading skeleton component for list placeholders
 * Displays multiple skeleton items in a vertical stack layout
 *
 * @param props - The component props
 * @returns The rendered list skeleton component
 */
export default function ListSkeleton({ itemCount, height, gap = "md" }: ListSkeletonProps) {
  // Generate skeleton items based on count
  const children = [];

  for (let i = 0; i < itemCount; i++) {
    children.push(<Skeleton key={i} h={height} />);
  }

  return (
    <Stack h="100%" justify="stretch" gap={gap}>
      {children}
    </Stack>
  );
}
