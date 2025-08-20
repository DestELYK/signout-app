/**
 * Person loans history route displaying all loans associated with a specific person
 *
 * This route provides loan history for a person including:
 * - List of all loans by the person (active and historical)
 * - Loan details with item information and QR codes
 * - Loan status tracking (active, returned, overdue)
 * - Interactive loan selection and navigation
 * - Item details within each loan display
 *
 * @requires LoanSimpleView component for loan display
 * @requires QRCodeWithComponent for item identification
 * @requires StatusBadge and HoverBadge for status display
 * @requires TagGroup component for tag visualization
 * @inherits person data from parent people_.$personId route
 *
 * @module routes/people/$personId/loans
 *
 * @author Kyle Dunn
 */

import { Accordion, Button, Card, Center, Group, Stack, Text } from "@mantine/core";
import { Link, useNavigation, useParams, useSearchParams } from "@remix-run/react";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import HoverBadge from "~/components/HoverBadge";
import LoanSimpleView from "~/components/loans/LoanSimpleView";
import { QRCodeWithComponent } from "~/components/qrCode/QRCodeWithComponent";
import StatusBadge from "~/components/StatusBadge";
import TagGroup from "~/components/tags/TagGroup";
import { LoanData } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import { loader } from "./people_.$personId";

/**
 * Person loans component
 * Renders comprehensive loan history for the person with interactive selection
 *
 * @returns JSX element containing loan history or error/loading states
 */
export default function Page() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const params = useParams();

  // Get person data from parent route loader
  const personData = useTypedRouteLoaderData<typeof loader>("routes/people_.$personId");

  const personId = params.personId;
  const loanId = searchParams.get("id");

  /**
   * Creates a loan display component with item details and QR codes
   * @param loan - The loan data to display
   * @returns JSX element with detailed loan information
   */
  const loanItem = (loan: LoanData) => (
    <>
      {/* Loan details card with item information */}
      <Card w="100%" withBorder>
        {/* Render each item in the loan */}
        {loan.items.map((item) => (
          <Card.Section key={item.itemId} inheritPadding withBorder py="sm">
            {/* QR code integration for item identification */}
            <QRCodeWithComponent key={item.itemId} qrCode={item.uuid}>
              <Stack w="100%" gap={0}>
                {/* Item name with navigation link */}
                <Text component={Link} to={`/items/${item.itemId}`}>
                  {item.name}
                </Text>
                {item.dateReturned && (
                  <>
                    {item.returnedBy && item.returnedBy.id.toString() !== personId && (
                      <Text size="xs">
                        Returned By:{" "}
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "red",
                          }}
                        >
                          {formatFullName(item.returnedBy)}
                        </span>
                      </Text>
                    )}
                    <Text size="xs">
                      Date Returned:{" "}
                      {formatDate(item.dateReturned, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <br />
                      <span style={{ fontWeight: "bold" }}>
                        ({dateDiff({ date: item.dateReturned })})
                      </span>
                    </Text>
                  </>
                )}
                <Group justify="end" mt="sm">
                  {item.type && (
                    <HoverBadge name={item.type.name} description={item.type.description} />
                  )}
                  {item.status && <StatusBadge status={item.status} />}
                </Group>
              </Stack>
            </QRCodeWithComponent>
          </Card.Section>
        ))}
      </Card>
      <Group justify="end" mt="sm">
        <TagGroup tags={loan.tags} />
        <Button
          variant="outline"
          rightSection={<IconArrowRight />}
          component={Link}
          to={`/loans/${loanId}`}
        >
          View
        </Button>
        {loan.dateReturned === null && (
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
      {personData &&
        (personData.error ? (
          <Text ta="center" c="red">
            {personData.error}
          </Text>
        ) : personData.data && personData.data.loans && personData.data.loans.length > 0 ? (
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
              {personData.data.loans.map((loan) => (
                <Accordion.Item key={loan.id} value={loan.id.toString()}>
                  <Accordion.Control>
                    <LoanSimpleView
                      id={loan.id}
                      dateLoaned={loan.dateLoaned}
                      itemCount={loan.itemsCount}
                      status={loan.status}
                    />
                  </Accordion.Control>
                  <Accordion.Panel>{loanItem(loan)}</Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </>
        ) : (
          <Center h="100%">
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
