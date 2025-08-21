/**
 * LoanListView Component
 *
 * A individual loan view component for displaying
 * loan information within lists and collections. Provides 
 * loan details with navigation, status indicators, and highlighting.
 *
 *
 * @module LoanListView
 *
 * @author Kyle Dunn
 */

import { Flex, Group, Highlight, Space, Text, Title, UnstyledButton } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { IconArrowRight } from "@tabler/icons-react";
import items from "~/routes/items";
import { LoanData } from "~/utils/types.server";
import { dateDiff, formatFullName } from "~/utils/utils";
import DateDisplay from "../DateDisplay";
import StatusBadge from "../StatusBadge";

/**
 * Props for the LoanListView component
 */
export interface LoanListViewProps {
  /** Loan data to display */
  data: LoanData;
  /** Search term to highlight in loan details */
  query?: string;
  /** Optional UUID for additional identification */
  uuid?: string;
}

/**
 * A comprehensive individual loan view component for list display
 * Shows loan details with navigation, status indicators, and highlighting
 *
 * @param props - The component props
 * @returns The rendered loan list view component
 */
export default function LoanListView({ data, query }: LoanListViewProps) {
  const navigate = useNavigate();

  return (
    <UnstyledButton
      className="list-item"
      miw={200}
      w="100%"
      h="100%"
      p="xs"
      onClick={() => navigate(`/loans/${data.id}`)}
    >
      <Flex direction="row" align="center" justify="space-between" gap="xs">
        <Flex w="100%" direction="column">
          <Flex direction="row" align="center" wrap="nowrap" justify="space-between">
            {/* Loan ID as title */}
            <Title order={4}>{`#${data.id}`}</Title>
            <StatusBadge status={data.status} />
          </Flex>
          {/* Person name with search highlighting */}
          <Highlight highlight={query ? query.split(" ") : ""}>{`${formatFullName(
            data.person
          )}`}</Highlight>
          {/* Display first 2 items in the loan */}
          {data.items.slice(0, 2).map((i) => (
            <Group key={i.loanId + i.itemId}>
              <Highlight
                key={i.itemId}
                size="xs"
                c={"dimmed"}
                highlight={query ? query.split(" ") : ""}
              >
                {i.name}
              </Highlight>
              <Text
                size="xs"
                fw="bold"
                c={
                  data.status.id === "returned"
                    ? data.status.color
                    : i.status
                    ? i.status.color
                    : "dimmed"
                }
              >
                {data.status.id === "returned"
                  ? `(${data.status.name})`
                  : i.status
                  ? ` (${i.status.name})`
                  : "Unknown Status"}
              </Text>
            </Group>
          ))}
          {data.items.length > 2 && (
            <Text fs="italic" size="xs">
              ...and {items.length - 2} other items
            </Text>
          )}
          {data.items.length > 0 && <Space h="sm" />}
          <Text size="xs">
            Created: <DateDisplay date={data.dateLoaned} inherit span />{" "}
            <b>({dateDiff({ date: data.dateLoaned })})</b>
          </Text>
        </Flex>
        <IconArrowRight />
      </Flex>
    </UnstyledButton>
  );
}
