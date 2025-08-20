/**
 * StatusBadge Component
 *
 * A specialized badge component for displaying item status information
 * with consistent styling and color coding. Automatically handles
 * color contrast and null status values.
 *
 *
 * @module StatusBadge
 *
 * @author Kyle Dunn
 */

import { Badge, BadgeProps } from "@mantine/core";
import { ItemStatusData } from "~/utils/types.server";

/**
 * Props for the StatusBadge component
 */
export interface StatusBadgeProps {
  /** Status data containing name and color information */
  status?: ItemStatusData;
  /** Additional props to pass to the Badge component */
  badgeProps?: BadgeProps;
}

/**
 * A status display badge with automatic color coding and contrast
 * Renders nothing if no status is provided
 *
 * @param props - The component props
 * @returns The rendered status badge or null
 */
export default function StatusBadge({ status, badgeProps }: StatusBadgeProps) {
  return status ? (
    <Badge key={status.id} color={status.color} {...badgeProps} autoContrast>
      {status.name}
    </Badge>
  ) : null;
}
