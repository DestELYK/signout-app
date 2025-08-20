/**
 * LoanedItemInfoView Component
 *
 * A specialized view component for displaying information about
 * items that are currently on loan in the signout system. Provides
 * loan details with navigation and visual indicators.
 *
 *
 * @module LoanedItemInfoView
 *
 * @author Kyle Dunn
 */

import { Flex, Group, Stack, Text } from "@mantine/core";
import { Link } from "@remix-run/react";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";

import { LoanedItemData } from "~/utils/types.server";
import StatusBadge from "../StatusBadge";
import QRCodePreview from "../qrCode/QRCodePreview";
import TagGroup from "../tags/TagGroup";

/**
 * Props for the LoanedItemInfoView component
 */
export interface LoanedItemInfoViewProps {
  /** Loaned item data to display */
  data: LoanedItemData;
  /** Optional content to display on the right side */
  rightSection?: React.ReactNode;
  /** Whether to show detailed loan information */
  showDetails?: boolean;
  /** Whether to show outstanding loan indicators */
  showOutstanding?: boolean;
  /** Optional children content */
  children?: React.ReactNode;
}

/**
 * A specialized view component for loaned item information
 * Displays comprehensive loan details with navigation and status
 *
 * @param props - The component props
 * @returns The rendered loaned item info view component
 */
export default function LoanedItemInfoView({
  data,
  rightSection,
  showDetails = true,
  showOutstanding = true,
  children,
}: LoanedItemInfoViewProps) {
  return (
    <Stack gap={0} mb="sm" w="100%">
      <Flex w="100%" direction="row" wrap="nowrap" align="center" justify="space-between" mb="sm">
        <Flex direction="row" wrap="nowrap" align="center" gap="xs">
          {/* QR Code preview for item identification */}
          <QRCodePreview qrCode={data.uuid} />
          <Stack gap={0}>
            {/* Clickable item name with navigation */}
            <Text
              fw="bold"
              lineClamp={1}
              component={Link}
              to={`/items/${data.itemId}`}
              style={{ cursor: "pointer" }}
            >
              {data.name}
            </Text>
            {/* Item tags for categorization */}
            <Group gap="xs">
              {data.tags && data.tags.length > 0 && (
                <TagGroup tags={data.tags} categories={["Item Type"]} badgeProps={{ size: "xs" }} />
              )}
            </Group>
          </Stack>
        </Flex>
        <Flex direction="row" align="center" wrap="nowrap" gap="xs">
          {/* Outstanding Indicator */}
          {showOutstanding && data.dateLoaned && <StatusBadge status={data.status} />}
          {rightSection}
        </Flex>
      </Flex>
      {/* Description */}
      {showDetails && data.description && (
        <Text size="sm" lineClamp={1} mb="sm" fs="italic">
          {data.description}
        </Text>
      )}
      {/* Date Returned */}
      {showDetails &&
        (data.dateReturned ? (
          <Text size="xs" lineClamp={1}>
            Returned: {formatDate(data.dateReturned)} ({dateDiff({ date: data.dateReturned })})
          </Text>
        ) : (
          data.dateLoaned && (
            <Text size="xs" lineClamp={1}>
              Last Seen: {formatDate(data.dateLoaned)} ({dateDiff({ date: data.dateLoaned })})
            </Text>
          )
        ))}
      {/* Returned By */}
      {data.returnedBy && (
        <Text size="xs" lineClamp={1}>
          Returned by:{" "}
          <Text span inherit fw="bold">
            {formatFullName(data.returnedBy)}
          </Text>
        </Text>
      )}
      {children}
    </Stack>
  );
}
