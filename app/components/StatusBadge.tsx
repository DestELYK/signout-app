import { Badge, BadgeProps } from "@mantine/core";
import { ItemStatusData } from "~/utils/types.server";

export interface StatusBadgeProps {
    status?: ItemStatusData;
    badgeProps?: BadgeProps;
}

export default function StatusBadge({ status, badgeProps }: StatusBadgeProps) {
    return status ? (
        <Badge key={status.id} color={status.color} {...badgeProps} autoContrast>
            {status.name}
        </Badge>
    ) : null;
}
