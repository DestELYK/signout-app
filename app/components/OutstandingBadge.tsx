import { Badge, BadgeProps } from "@mantine/core";
import { Tag } from "@prisma/client";

export const OUT_COLOR = "#F21616";
export const IN_COLOR = "#00ff54";

export function createOutstandingTag({
  out,
  category = "Item Status",
  outLabel = "Outstanding",
  inLabel = "Returned",
}: {
  out: boolean;
  category?: string;
  outLabel?: string;
  inLabel?: string;
}) {
  return {
    id: -1,
    name: out ? outLabel : inLabel,
    color: out ? OUT_COLOR : IN_COLOR,
    category: category,
    priority: -100,
    hidden: false,
  } satisfies Tag;
}

export default function OutstandingBadge({
  out,
  badgeProps,
  shortForm,
}: {
  out?: boolean;
  badgeProps?: BadgeProps;
  shortForm?: boolean;
}) {
  return (
    <Badge color={out ? OUT_COLOR : IN_COLOR} {...badgeProps} autoContrast>
      {shortForm ? (out ? "Out" : "In") : out ? "Outstanding" : "Returned"}
    </Badge>
  );
}
