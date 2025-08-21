/**
 * LocationBadge Component
 *
 * A specialized badge component for displaying item location information
 * in the signout system. Extends the HoverBadge component with location-specific
 * styling and behavior.
 *
 *
 * @module LocationBadge
 *
 * @author Kyle Dunn
 */

import { LocationData } from "~/utils/types.server";
import HoverBadge, { HoverBadgeProps } from "../HoverBadge";

/**
 * Props for the LocationBadge component
 */
export interface LocationBadgeProps {
  /** Optional location data to display */
  data?: LocationData;
  /** Whether the badge should be clickable (default: false) */
  clickable?: boolean;
  /** The route type to navigate to when clicked */
  redirectRoute?: "items" | "loans" | "people";
}

/**
 * A specialized badge component for location display
 * Shows location name with consistent green styling and hover behavior
 *
 * @param props - The component props including location data and badge/tooltip props
 * @returns The rendered location badge component or null if no data
 */
export default function LocationBadge({
  data,
  clickable = false,
  redirectRoute = "items",
  badgeProps,
  tooltipProps,
}: LocationBadgeProps &
  Omit<
    HoverBadgeProps,
    "name" | "description" | "color" | "clickable" | "redirectRoute" | "filterParam" | "filterValue"
  >) {
  return (
    data && (
      <HoverBadge
        name={data.name}
        color="green"
        badgeProps={badgeProps}
        tooltipProps={tooltipProps}
        clickable={clickable}
        redirectRoute={redirectRoute}
        filterParam="location"
        filterValue={data.name}
      />
    )
  );
}
