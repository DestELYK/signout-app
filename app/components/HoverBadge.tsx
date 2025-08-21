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

import { Badge, BadgeProps, Tooltip, TooltipProps, UnstyledButton } from "@mantine/core";
import { useNavigate } from "@remix-run/react";

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
  /** Whether the badge should be clickable (default: false) */
  clickable?: boolean;
  /** The route type to navigate to when clicked */
  redirectRoute?: "items" | "loans" | "people";
  /** The filter parameter name to use in the URL */
  filterParam?: string;
  /** The filter value to use in the URL */
  filterValue?: string;
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
  clickable = false,
  redirectRoute = "items",
  filterParam,
  filterValue,
}: HoverBadgeProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!clickable || !filterParam || !filterValue) return;
    const baseUrl = `/${redirectRoute}/list`;
    const param = `${filterParam}=${encodeURIComponent(filterValue)}`;
    navigate(`${baseUrl}?${param}`);
  };

  const badge = (
    <Badge color={color} variant="filled" {...badgeProps} autoContrast>
      {name}
    </Badge>
  );

  const wrappedBadge = description ? (
    <Tooltip label={description} position="bottom" arrowSize={12} withArrow {...tooltipProps}>
      {badge}
    </Tooltip>
  ) : (
    badge
  );

  if (!clickable || !filterParam || !filterValue) {
    return wrappedBadge;
  }

  return (
    <UnstyledButton
      onClick={handleClick}
      style={{ cursor: "pointer" }}
      onMouseEnter={(e) => {
        const badge = e.currentTarget.querySelector("[data-badge]") as HTMLElement;
        if (badge) badge.style.opacity = "0.8";
      }}
      onMouseLeave={(e) => {
        const badge = e.currentTarget.querySelector("[data-badge]") as HTMLElement;
        if (badge) badge.style.opacity = "1";
      }}
    >
      <div data-badge>
        {description ? (
          <Tooltip label={description} position="bottom" arrowSize={12} withArrow {...tooltipProps}>
            <Badge
              color={color}
              variant="filled"
              {...badgeProps}
              autoContrast
              style={{
                ...badgeProps?.style,
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
            >
              {name}
            </Badge>
          </Tooltip>
        ) : (
          <Badge
            color={color}
            variant="filled"
            {...badgeProps}
            autoContrast
            style={{
              ...badgeProps?.style,
              cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
          >
            {name}
          </Badge>
        )}
      </div>
    </UnstyledButton>
  );
}
