/**
 * PersonListView Component
 *
 * A individual person view component for displaying
 * person information within lists and collections. Provides 
 * person details with navigation, role information, and highlighting.
 *
 *
 * @module PersonListView
 *
 * @author Kyle Dunn
 */

import { Badge, Flex, Group, Highlight, Space, Text, Title, UnstyledButton } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { IconChevronRight, IconInfoCircle } from "@tabler/icons-react";
import { PersonData } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";

/**
 * Props for the PersonListView component
 */
export interface PersonListViewProps {
  /** Person data to display */
  person: PersonData;
  /** Whether to show navigation chevron */
  showChevron?: boolean;
  /** Search query for highlighting */
  query?: string;
  /** Person ID for QR-based highlighting */
  personId?: string;
  /** Whether the person has returned items */
  returned?: boolean;
  /** Whether to hide role information in the display */
  hideRole?: boolean;
}

/**
 * A comprehensive individual person view component for list display
 * Shows person details with navigation, role info, and highlighting
 *
 * @param props - The component props
 * @returns The rendered person list view component
 */
export default function PersonListView({
  person,
  query,
  personId,
  showChevron = true,
  returned,
  hideRole = false,
}: PersonListViewProps) {
  const navigate = useNavigate();
  const fullName = formatFullName(person);

  return (
    <UnstyledButton
      className="list-item"
      miw={200}
      onClick={() => navigate(`/people/${person.id}`)}
    >
      <Flex p="xs" direction="row" align="center">
        <Flex w="100%" direction="column" mr="lg">
          <Group align="center" justify="space-between" gap={2}>
            <Flex direction="row" align="center" wrap="nowrap" justify="start" gap="sm">
              {/* Lost items warning indicator */}
              {person.lostItems !== undefined && person.lostItems.length > 0 && (
                <IconInfoCircle color="red" />
              )}
              {/* Person name with context-aware highlighting */}
              <Highlight
                component={Title}
                order={4}
                highlight={
                  personId
                    ? personId === person.schoolId
                      ? fullName
                      : ""
                    : query
                    ? query.split(" ")
                    : ""
                }
              >
                {fullName}
              </Highlight>
            </Flex>

            {person.role !== undefined && (
              <Badge miw={100} color={person.role.color} variant="dot" autoContrast>
                {person.role.name}
              </Badge>
            )}
          </Group>
          <Space h="xs" />

          <Text size="xs">
            {person.loansCount ?? 0} Total Loans{" "}
            {person.outstandingItemsCount ? (
              <>
                <Text span inherit c="red" fw="bold">
                  ({person.outstandingItemsCount} Outstanding)
                </Text>
              </>
            ) : undefined}
          </Text>
          {person.lostItemsCount !== undefined && person.lostItemsCount > 0 && (
            <Text mt="sm" fw="bold" size="xs" c="red">
              {person.lostItemsCount} Problem Item
              {person.lostItemsCount > 1 ? "s" : ""}
            </Text>
          )}
          {person.lostItems?.slice(0, 2).map((i) => (
            <Group key={i.id}>
              <Highlight
                size="xs"
                c={
                  i.status && i.status.id === "returned"
                    ? i.status.color
                    : i.status
                    ? i.status.color
                    : "dimmed"
                }
                highlight={query ? query.split(" ") : ""}
              >
                {i.name}
              </Highlight>
              <Text size="xs" c="dimmed">
                {i.status && i.status.id === "returned"
                  ? `(${i.status.name})`
                  : i.status
                  ? ` (${i.status.name})`
                  : "Unknown Status"}
              </Text>
            </Group>
          ))}
          {person.lostItems !== undefined && person.lostItems.length > 2 && (
            <Text fs="italic" size="xs">
              ...and {person.lostItems.length - 2} other items
            </Text>
          )}
          {returned && (
            <Text mt="sm" size="xs" c="red">
              Person did not return all of their items
            </Text>
          )}
        </Flex>
        {showChevron && <IconChevronRight />}
      </Flex>
    </UnstyledButton>
  );
}
