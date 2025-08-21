/**
 * ItemListView Component
 *
 * A individual item view component for displaying
 * item information within lists and collections. Provides 
 * item details with navigation, QR code support, and highlighting.
 *
 *
 * @module ItemListView
 *
 * @author Kyle Dunn
 */

import { Badge, Flex, Highlight, Space, Text, UnstyledButton } from "@mantine/core";
import { Link, useNavigate } from "@remix-run/react";
import { IconChevronRight } from "@tabler/icons-react";
import { ItemData } from "~/utils/types.server";
import { dateDiff, formatFullName } from "~/utils/utils";
import DateDisplay from "../DateDisplay";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";
import LocationBadge from "./LocationBadge";

/**
 * Props for the ItemListView component
 */
export interface ItemListViewProps {
  /** Item data to display */
  data: ItemData;
  /** Search term to highlight in item name */
  highlight?: string;
  /** Whether to display QR code for the item */
  displayQRCode?: boolean;
}

/**
 * A comprehensive individual item view component for list display
 * Shows item details with navigation, highlighting, and QR code support
 *
 * @param props - The component props
 * @returns The rendered item list view component
 */
export default function ItemListView({ data, highlight, displayQRCode }: ItemListViewProps) {
  const navigate = useNavigate();

  // Main item content with rich information display
  const content = (
    <Flex direction="row" align="center" justify="space-between">
      <Flex w="100%" direction="column" mr="lg">
        <Flex w="100%" direction="row" align="center" justify="space-between" wrap="nowrap">
          {/* Item name with search highlighting */}
          <Highlight
            fw="bold"
            size="md"
            lineClamp={2}
            highlight={highlight ? highlight.split(" ") : ""}
          >
            {data.name}
          </Highlight>
          <LocationBadge data={data.location} />
        </Flex>
        {/* Status badge if available */}
        {data.status && (
          <Badge color={data.status.color} autoContrast>
            {data.status.name}
          </Badge>
        )}
        <Space h="xs" />
        {/* Item description with line clamping */}
        {data.description && (
          <Text size="xs" fs="italic" lineClamp={1} mt="xs">
            {data.description}
          </Text>
        )}

        {/* Creation date with relative time */}
        {data.createdDate && (
          <Text size="xs">
            Added:{" "}
            <DateDisplay
              date={data.createdDate!}
              formatOptions={{
                month: "short",
                day: "2-digit",
                year: "numeric",
              }}
              inherit
            />{" "}
            <b>({dateDiff({ date: data.createdDate! })})</b>
          </Text>
        )}

        {/* Last loan information if available */}
        {data.lastLoan && (
          <>
            {data.lastLoan.person && (
              <Text size="xs">
                Last Loaned by{" "}
                <Link
                  to={`/people/${data.lastLoan.person.id}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  {formatFullName(data.lastLoan.person)}
                </Link>
              </Text>
            )}

            {data.lastLoan.dateLoaned && (
              <Text size="xs">
                <DateDisplay
                  date={data.lastLoan.dateLoaned}
                  prefix={data.lastLoan.dateAllReturned ? "Returned " : "Loaned "}
                  formatOptions={{
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }}
                  inherit
                  span
                />
                <b>
                  {" "}
                  (
                  {dateDiff({
                    date: data.lastLoan.dateLoaned,
                    otherDate: data.lastLoan.dateAllReturned,
                    withoutSuffix: data.lastLoan.dateAllReturned !== undefined,
                  })}
                  )
                </b>
              </Text>
            )}
          </>
        )}
      </Flex>
      <IconChevronRight />
    </Flex>
  );

  return (
    <UnstyledButton
      className="list-item"
      w="100%"
      h="100%"
      onClick={() => navigate(`/items/${data.id}`)}
      p="xs"
    >
      {displayQRCode ? (
        <QRCodeWithComponent qrCode={data.uuid} scale={2}>
          {content}
        </QRCodeWithComponent>
      ) : (
        content
      )}
    </UnstyledButton>
  );
}
