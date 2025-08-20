/**
 * HoverBadge Component
 *
 * A badge component that displays additional information on hover
 * through a tooltip. Provides user experience for
 * displaying contextual information without cluttering the UI.
 *
 *
 * @module HoverBadge
 *
 * @author Kyle Dunn
 */

import { Badge, BadgeProps, Tooltip, TooltipProps } from "@mantine/core";

/**
 * Props for the HoverBadge component
 */
export interface HoverBadgeProps {
  /** The display name/text for the badge */
  name: string;
  /** Optional description shown in tooltip on hover */
  description?: string;
  /** Color theme for the badge */
  color?: BadgeProps["color"];
  /** Additional props passed to the Badge component */
  badgeProps?: BadgeProps;
  /** Additional props passed to the Tooltip component */
  tooltipProps?: TooltipProps;
}

/**
 * A badge component with hover tooltip for additional context
 * Shows description in tooltip when provided, otherwise renders plain badge
 *
 * @param props - The component props
 * @returns The rendered hover badge component with optional tooltip
 */
export default function HoverBadge({
  name,
  description,
  color,
  badgeProps,
  tooltipProps,
}: HoverBadgeProps) {
  const badge = (
    <Badge color={color} variant="filled" {...badgeProps} autoContrast>
      {name}
    </Badge>
  );

  return description ? (
    <Tooltip label={description} position="bottom" arrowSize={12} withArrow {...tooltipProps}>
      {badge}
    </Tooltip>
  ) : (
    badge
  );
}
