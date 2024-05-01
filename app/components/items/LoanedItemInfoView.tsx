import { Flex, Group, Stack, Text } from "@mantine/core";
import { Link } from "@remix-run/react";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";

import { Tag } from "@prisma/client";
import OutstandingBadge from "../OutstandingBadge";
import QRCodePreview from "../qrCode/QRCodePreview";
import TagGroup from "../tags/TagGroup";

export interface LoanedItemInfoViewProps {
  id: number;
  qrCode?: string | null;
  name: string;
  description?: string | null;
  dateLoaned?: Date | null;
  dateReturned?: Date | null;
  returnedBy?: {
    id: number;
    firstName: string;
    lastName: string;
    nickname: string | null;
  } | null;
  tags?: Tag[] | null;
  rightSection?: React.ReactNode;
  showDetails?: boolean;
  showOutstanding?: boolean;
  children?: React.ReactNode;
}

export default function LoanedItemInfoView({
  id,
  qrCode,
  name,
  description,
  dateLoaned,
  dateReturned,
  returnedBy,
  tags,
  rightSection,
  showDetails = true,
  showOutstanding = true,
  children,
}: LoanedItemInfoViewProps) {
  return (
    <Stack gap={0} mb="sm" w="100%">
      <Flex
        w="100%"
        direction="row"
        wrap="nowrap"
        align="center"
        justify="space-between"
        mb="sm"
      >
        <Flex direction="row" wrap="nowrap" align="center" gap="xs">
          {/* QR Code Image */}
          <QRCodePreview qrCode={qrCode} />
          <Stack gap={0}>
            {/* Item Name */}
            <Text
              fw="bold"
              lineClamp={1}
              component={Link}
              to={`/items/${id}`}
              style={{ cursor: "pointer" }}
            >
              {name}
            </Text>
            {/* Tags */}
            <Group gap="xs">
              {tags && tags.length > 0 && (
                <TagGroup
                  tags={tags}
                  categories={["Item Type"]}
                  badgeProps={{ size: "xs" }}
                />
              )}
            </Group>
          </Stack>
        </Flex>
        <Flex direction="row" align="center" wrap="nowrap" gap="xs">
          {/* Outstanding Indicator */}
          {showOutstanding && dateLoaned && (
            <OutstandingBadge out={!dateReturned} />
          )}
          {rightSection}
        </Flex>
      </Flex>
      {/* Description */}
      {showDetails && description && (
        <Text size="sm" lineClamp={1} mb="sm" fs="italic">
          {description}
        </Text>
      )}
      {/* Date Returned */}
      {showDetails &&
        (dateReturned ? (
          <Text size="xs" lineClamp={1}>
            Returned: {formatDate(dateReturned)} ({dateDiff(dateReturned)})
          </Text>
        ) : (
          dateLoaned && (
            <Text size="xs" lineClamp={1}>
              Last Seen: {formatDate(dateLoaned)} ({dateDiff(dateLoaned)})
            </Text>
          )
        ))}
      {/* Returned By */}
      {returnedBy && (
        <Text size="xs" lineClamp={1}>
          Returned by:{" "}
          <Text span inherit fw="bold">
            {formatFullName(returnedBy)}
          </Text>
        </Text>
      )}
      {children}
    </Stack>
  );
}
