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

import { Badge, BadgeProps, UnstyledButton } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { ItemStatusData } from "~/utils/types.server";

/**
 * Props for the StatusBadge component
 */
export interface StatusBadgeProps {
  /** Status data containing name and color information */
  status?: ItemStatusData;
  /** Additional props to pass to the Badge component */
  badgeProps?: BadgeProps;
  /** Whether the badge should be clickable (default: false) */
  clickable?: boolean;
  /** The route type to navigate to when clicked */
  redirectRoute?: "items" | "loans" | "people";
}

/**
 * A status display badge with automatic color coding and contrast
 * Renders nothing if no status is provided
 *
 * @param props - The component props
 * @returns The rendered status badge or null
 */
export default function StatusBadge({
  status,
  badgeProps,
  clickable = false,
  redirectRoute = "items",
}: StatusBadgeProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!status || !clickable) return;
    const baseUrl = `/${redirectRoute}/list`;
    const statusParam = `status=${encodeURIComponent(status.id)}`;
    navigate(`${baseUrl}?${statusParam}`);
  };

  if (!status) return null;

  const badge = (
    <Badge key={status.id} color={status.color} {...badgeProps} autoContrast>
      {status.name}
    </Badge>
  );

  if (!clickable) {
    return badge;
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
        <Badge
          key={status.id}
          color={status.color}
          {...badgeProps}
          autoContrast
          style={{
            ...badgeProps?.style,
            cursor: "pointer",
            transition: "opacity 0.2s ease",
          }}
        >
          {status.name}
        </Badge>
      </div>
    </UnstyledButton>
  );
}
