import { Badge, BadgeProps, Tooltip, TooltipProps } from "@mantine/core";

/**
 * Props for the HoverBadge component.
 */
export interface HoverBadgeProps {
    name: string;
    description?: string;
    color?: BadgeProps["color"];
    badgeProps?: BadgeProps;
    tooltipProps?: TooltipProps;
}

/**
 * Renders a hoverable badge component.
 *
 * @param name - The name of the badge.
 * @param description - The description of the badge.
 * @param badgeProps - Additional props for the badge component.
 * @param tooltipProps - Additional props for the tooltip component.
 * @returns The rendered hover badge component.
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
