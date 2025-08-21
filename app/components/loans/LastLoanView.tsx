/**
 * LastLoanView Component
 *
 * A specialized view component for displaying the most recent loan
 * information in the signout system. Provides loan
 * details with optional person and item information display.
 *
 *
 * @module LastLoanView
 *
 * @author Kyle Dunn
 */

import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  MantineStyleProps,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { Link, useNavigate } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import { LastLoanData } from "~/utils/types.server";
import { dateDiff, formatFullName } from "~/utils/utils";
import InfoView from "../base/InfoView";
import ListView from "../base/ListView";
import DateDisplay from "../DateDisplay";
import StatusBadge from "../StatusBadge";
import TagGroup from "../tags/TagGroup";

/**
 * Props for the LastLoanView component
 */
export interface LastLoanViewProps {
  /** Width of the component */
  w?: MantineStyleProps["w"];
  /** Height of the component */
  h?: MantineStyleProps["h"];
  /** Optional last loan data to display */
  data?: LastLoanData;
  /** Whether to show person information */
  showPerson?: boolean;
  /** Whether to show items list */
  showItems?: boolean;
  /** Optional prefix text for display */
  prefix?: string;
}

/**
 * A specialized view component for last loan information
 * Shows recent loan details with optional person and item information
 *
 * @param props - The component props
 * @returns The rendered last loan view component
 */
export default function LastLoanView({
  w,
  h,
  data,
  showPerson = true,
  showItems = true,
  prefix,
}: LastLoanViewProps) {
  const navigate = useNavigate();

  return data === undefined ? (
    // Empty state when no loan data is available
    <Card withBorder>
      <Stack w="100%" h="100%" align="center" justify="center">
        <Text c="dimmed">No Previous Loan</Text>
        <Button
          onClick={() => {
            navigate("/loans?create=");
          }}
        >
          Create New Loan
        </Button>
      </Stack>
    </Card>
  ) : (
    <InfoView
      title={`${prefix ? `${prefix} ` : ""}#${data.id}`}
      href={`/loans/${data.id}`}
      rightSection={<StatusBadge status={data.status} />}
      collapseOpen={showPerson}
      collapseSection={
        data.person && (
          <Group justify="space-between">
            <Text component={Link} to={`/people/${data.person.id}`}>
              <b>Loaned by: </b>
              {formatFullName(data.person)}
            </Text>
            {data.person.role && (
              <Badge color={data.person.role.color} autoContrast>
                {data.person.role.name}
              </Badge>
            )}
          </Group>
        )
      }
      bottomSection={
        data.tags !== undefined && data.tags.length > 0 ? (
          <TagGroup tags={data.tags} groupProps={{ justify: "end" }} />
        ) : undefined
      }
      cardProps={{ w, h, padding: 0 }}
    >
      <Stack gap={0} pt="sm">
        <Box px="sm">
          {data.dateLoaned && (
            <>
              <Text>
                <b>
                  {dateDiff({
                    date: data.dateLoaned,
                    withoutSuffix: true,
                    skipToday: true,
                    skipYesterday: true,
                  })}
                </b>{" "}
                since loan was created
              </Text>
              <DateDisplay date={data.dateLoaned} size="xs" c="dimmed" fs="italic" />
            </>
          )}
          {data.dateAllReturned && (
            <>
              <ClientOnly fallback={<Text mt="sm">Loading return info...</Text>}>
                {() => (
                  <Text mt="sm">
                    It took <b>{dateDiff({ date: data.dateAllReturned!, withoutSuffix: true })}</b>{" "}
                    for all items to be returned
                  </Text>
                )}
              </ClientOnly>
              <DateDisplay date={data.dateAllReturned} size="xs" c="dimmed" fs="italic" />
            </>
          )}
        </Box>
        {data.items &&
          (showItems ? (
            <>
              <Space h="sm" />
              <Divider w="100%" />
              <ListView
                data={data.items}
                orientation="horizontal"
                withSearch={false}
                showPagination={false}
                w="100%"
                h={120}
                withinParent
              >
                {(item) => (
                  <Box pos="relative" miw={250} h="100%" p="xs">
                    <Stack h="100%" gap={0}>
                      <Text component={Link} to={`/items/${item.id}`} fw="bold" lineClamp={1}>
                        {item.name}
                      </Text>
                      <Text fw="bold" mb="md" size="sm" lineClamp={1}>
                        Current Status:{" "}
                        <Text span c={item.status?.color ?? "gray"}>
                          {item.status?.name ?? "Unknown"}
                        </Text>
                      </Text>
                      <Text fs="italic" c={item.description ? undefined : "dimmed"} lineClamp={1}>
                        {item.description || "No item description"}
                      </Text>
                    </Stack>
                  </Box>
                )}
              </ListView>
            </>
          ) : (
            <Text p="sm" c="dimmed">
              {data.items.length} item{data.items.length > 1 ? "s" : ""} total
            </Text>
          ))}
      </Stack>
    </InfoView>
  );
}
