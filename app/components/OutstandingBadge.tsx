import { Badge, BadgeProps } from "@mantine/core";
import { IN_COLOR, OUT_COLOR } from "~/utils/consts";

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
