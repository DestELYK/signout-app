/**
 * Item loans history route displaying all loans associated with a specific item
 *
 * This route provides loan history for an item including:
 * - List of all loans containing the item
 * - Loan details with borrower information
 * - Loan status tracking (active, returned, overdue)
 * - Interactive loan selection and navigation
 * - Timeline view of item usage history
 *
 * @requires LoanSimpleView component for loan display
 * @requires TagGroup component for tag visualization
 * @requires Accordion for expandable loan list
 * @inherits item data from parent items_.$itemId route
 *
 * @module routes/items/$itemId/loans
 *
 * @author Kyle Dunn
 */

import { Accordion, Button, Center, Flex, Group, Skeleton, Stack, Text } from "@mantine/core";
import { Link, useNavigation, useParams, useSearchParams } from "@remix-run/react";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import dayjs from "dayjs";
import { typedjson, useTypedLoaderData, useTypedRouteLoaderData } from "remix-typedjson";
import LoanSimpleView from "~/components/loans/LoanSimpleView";
import TagGroup from "~/components/tags/TagGroup";
import { LoanedItemData } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import { loader as itemLoader } from "./items_.$itemId";

import { LoaderFunctionArgs } from "@remix-run/node";
import { getLoanedItems } from "~/lib/loans.server";

/**
 * Server-side loader function for item loans data
 * Fetches all loans associated with the specific item
 *
 * @param params - Route parameters containing itemId
 * @returns JSON response with loaned items data
 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  return typedjson(await getLoanedItems(undefined, params.itemId));
};

/**
 * Item loans component
 * Renders comprehensive loan history for the item with interactive selection
 *
 * @returns JSX element containing loan history or error/loading states
 */
export default function Page() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const params = useParams();

  // Get loans data and parent item data
  const loansData = useTypedLoaderData<typeof loader>();
  const itemData = useTypedRouteLoaderData<typeof itemLoader>("routes/items_.$itemId");

  const loanId = searchParams.get("id");

  /**
   * Creates a loan display component with formatted information
   * @param loanedItem - The loaned item data to display
   * @returns JSX element with loan details
   */
  const createLoanedItem = (loanedItem: LoanedItemData) => (
    <>
      <Flex w="100%" direction="row" align="center" gap="sm" wrap="nowrap">
        <Flex w="100%" direction="column" gap="xs">
          {loanedItem.dateLoaned && (
            <Text size="xs">
              Date Loaned: {formatDate(loanedItem.dateLoaned)}
              <br />
              <span style={{ fontWeight: "bold" }}>
                ({dateDiff({ date: loanedItem.dateLoaned })})
              </span>
            </Text>
          )}
          {loanedItem.dateReturned && (
            <Text size="xs">
              Date Returned: {formatDate(loanedItem.dateReturned)}
              <br />
              <span style={{ fontWeight: "bold" }}>
                (Took {dayjs(loanedItem.dateReturned).from(loanedItem.dateLoaned, true)} to return)
              </span>
            </Text>
          )}
          {loanedItem.returnedBy && (
            <Text size="xs">
              Returned By:{" "}
              <span
                style={{
                  fontWeight: "bold",
                  color: loanedItem.person?.id !== loanedItem.returnedBy.id ? "red" : undefined,
                }}
              >
                {formatFullName(loanedItem.returnedBy)}
              </span>
            </Text>
          )}
        </Flex>
      </Flex>
      <Group justify="end" mt="sm">
        <TagGroup tags={loanedItem.tags} />
        <Button
          variant="outline"
          rightSection={<IconArrowRight />}
          component={Link}
          to={`/loans/${loanId}`}
        >
          View
        </Button>
        {loanedItem.dateReturned === null && (
          <Button
            variant="outline"
            rightSection={<IconCheck />}
            component={Link}
            to={`/loans/${loanId}/signin`}
          >
            Sign-In
          </Button>
        )}
      </Group>
    </>
  );

  return (
    <>
      {itemData &&
        (itemData.error ? (
          <Text ta="center" c="red">
            {itemData.error}
          </Text>
        ) : itemData.data && itemData.data.loans && itemData.data.loans.length > 0 ? (
          <>
            <Accordion
              onChange={(value) => {
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
              value={loanId || null}
            >
              {itemData.data.loans.map((loan) => {
                const loanedItem = loansData.data?.find((li) => li.loanId === loan.id);

                return (
                  <Accordion.Item key={loan.id} value={loan.id.toString()}>
                    <Accordion.Control>
                      <LoanSimpleView
                        id={loan.id}
                        dateLoaned={loan.dateLoaned}
                        person={loan.person}
                        itemCount={loan.itemCount}
                        status={loan.status}
                      />
                    </Accordion.Control>
                    <Accordion.Panel>
                      {loanedItem ? createLoanedItem(loanedItem) : <Skeleton />}
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </>
        ) : (
          <Center h="100%" p="sm">
            <Stack>
              <Text ta="center">No loans have been created</Text>
              <Button component={Link} to="/loans?create=">
                Create a new loan here
              </Button>
            </Stack>
          </Center>
        ))}
    </>
  );
}
