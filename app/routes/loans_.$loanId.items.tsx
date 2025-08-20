/**
 * Loan items detail view with expandable accordion interface
 *
 * This route provides view of all items within a specific loan with:
 * - Expandable accordion interface for item details
 * - QR code display with loan timeline information
 * - Return status and return person tracking
 * - Tag categorization and filtering
 * - Navigation to individual item details
 *
 * @requires Mantine Accordion, Button, Flex, Group, Stack, Text components
 * @requires QRCodeWithComponent for item identification
 * @requires StatusBadge for loan status display
 * @requires TagGroup for item categorization
 *
 * @module routes/loans_.$loanId.items
 *
 * @author Kyle Dunn
 */

import { Accordion, Button, Flex, Group, Stack, Text } from "@mantine/core";
import { Link, useNavigation, useParams, useSearchParams } from "@remix-run/react";
import { IconArrowRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { QRCodeWithComponent } from "~/components/qrCode/QRCodeWithComponent";
import StatusBadge from "~/components/StatusBadge";
import TagGroup from "~/components/tags/TagGroup";
import { loader } from "~/routes/loans_.$loanId";
import { LoanedItemData } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";

/**
 * Loan items detail page component
 * Displays expandable accordion interface for all items in a loan
 *
 * @returns JSX element containing accordion with loan item details
 */
export default function Page() {
  // URL search parameters for accordion state management
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const params = useParams();
  // Typed loader data from parent loan route
  const loanData = useTypedRouteLoaderData<typeof loader>("routes/loans_.$loanId");

  const loanId = params.loanId;
  // Currently expanded item ID from URL parameters
  const itemId = searchParams.get("id");

  /**
   * Renders detailed view of a loaned item with QR code and timeline
   * @param loanedItem - The loaned item data to display
   * @returns JSX element with QR code, timeline, tags, and navigation
   */
  const loanedItem = (loanedItem: LoanedItemData) => (
    <Stack gap="xs">
      {/* QR code component with embedded loan timeline information */}
      <QRCodeWithComponent qrCode={loanedItem.uuid} scale={2.5}>
        <Flex w="100%" direction="column" gap="xs">
          {/* Date loaned with duration calculation */}
          {loanedItem.dateLoaned && (
            <Text size="xs">
              Date Loaned: {formatDate(loanedItem.dateLoaned)}
              <br />
              <span style={{ fontWeight: "bold" }}>
                ({dateDiff({ date: loanedItem.dateLoaned })})
              </span>
            </Text>
          )}
          {/* Date returned with total loan duration */}
          {loanedItem.dateReturned && (
            <Text size="xs">
              Date Returned: {formatDate(loanedItem.dateReturned)}
              <br />
              <span style={{ fontWeight: "bold" }}>
                (Took {dayjs(loanedItem.dateReturned).from(loanedItem.dateLoaned, true)} to return)
              </span>
            </Text>
          )}
          {/* Return person with validation indicator */}
          {loanedItem.returnedBy && (
            <Text size="xs">
              Returned By:{" "}
              <span
                style={{
                  fontWeight: "bold",
                  // Red color if returned by someone other than the borrower
                  color: loanData?.data?.person.id !== loanedItem.returnedBy.id ? "red" : undefined,
                }}
              >
                {formatFullName(loanedItem.returnedBy)}
              </span>
            </Text>
          )}
        </Flex>
      </QRCodeWithComponent>
      {/* Tag display with item type categorization */}
      <TagGroup
        tags={loanedItem.tags}
        categories={["Item Type"]}
        blacklist
        groupProps={{ justify: "end" }}
      />
      {/* Navigation button to item details */}
      <Group justify="end" mt="sm">
        <Button
          variant="outline"
          rightSection={<IconArrowRight />}
          component={Link}
          to={`/items/${itemId}`}
        >
          View
        </Button>
      </Group>
    </Stack>
  );

  return (
    <>
      {loanData &&
        (loanData.error ? (
          // Error state display
          <Text ta="center" c="red">
            {loanData.error}
          </Text>
        ) : (
          loanData.data && (
            <>
              {/* Accordion interface for loan items */}
              <Accordion
                onChange={(value) => {
                  // Update URL parameters when accordion state changes
                  if (!value) {
                    setSearchParams(
                      (prev) => {
                        prev.delete("id");
                        return prev;
                      },
                      { replace: true }
                    );
                  } else {
                    setSearchParams({ id: value }, { replace: true });
                  }
                }}
                value={itemId || null}
              >
                {/* Map through all loan items */}
                {loanData.data.items.map((item) => (
                  <Accordion.Item key={item.itemId} value={item.itemId.toString()}>
                    {/* Accordion header with status badge and item info */}
                    <Accordion.Control icon={<StatusBadge status={item.status} />}>
                      <Text>{item.name}</Text>
                      <Text size="xs" fs="italic">
                        {item.description || "No description"}
                      </Text>
                    </Accordion.Control>
                    {/* Accordion panel with detailed item view */}
                    <Accordion.Panel>{loanedItem(item)}</Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </>
          )
        ))}
    </>
  );
}
