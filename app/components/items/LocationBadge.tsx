import { LocationData } from "~/utils/types.server";
import HoverBadge, { HoverBadgeProps } from "../HoverBadge";

/**
 * Props for the LocationBadge component.
 */
export interface LocationBadgeProps {
    data?: LocationData;
}

/**
 * Renders a location badge component.
 *
 * @param data - The data object containing the name of the location.
 * @param badgeProps - Additional props for the badge component.
 * @param tooltipProps - Additional props for the tooltip component.
 */
export default function LocationBadge({
    data,
    badgeProps,
    tooltipProps,
}: LocationBadgeProps & Omit<HoverBadgeProps, "name" | "description" | "color">) {
    return (
        data && (
            <HoverBadge
                name={data.name}
                color="green"
                badgeProps={badgeProps}
                tooltipProps={tooltipProps}
            />
        )
    );
}
