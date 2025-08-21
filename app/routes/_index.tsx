/**
 * Home Route (_index)
 *
 * The main dashboard/landing page route that displays an overview
 * of the signout system including recent loans, statistics,
 * outstanding items, and system health information.
 *
 *
 * @module IndexRoute
 *
 * @author Kyle Dunn
 */

import { AreaChart, Sparkline } from "@mantine/charts";
import {
  Box,
  Card,
  Center,
  Flex,
  Group,
  Loader,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { MetaFunction, useNavigate } from "@remix-run/react";
import dayjs from "dayjs";
import { Suspense } from "react";
import { typeddefer, useTypedLoaderData } from "remix-typedjson";
import InfoView from "~/components/base/InfoView";
import ListView from "~/components/base/ListView";
import { LoanList } from "~/components/loans/LoanList";
import PeopleList from "~/components/people/PeopleList";
import {
  DesktopDashboardSkeleton,
  MobileDashboardSkeleton,
  StatViewSkeleton,
} from "~/components/skeletons/DashboardSkeleton";
import StatView from "~/components/StatView";
import { cache, CACHE_KEYS } from "~/lib/cache.server";
import { getItemsGroupedByType } from "~/lib/items.server";
import { getLoans, getTotalOutstandingLoans, groupLoansByYear } from "~/lib/loans.server";
import { getPeopleWithInvalidItems } from "~/lib/people.server";
import { MAX_RECENT_ITEMS } from "~/utils/consts";

/**
 * Meta function for document head configuration
 * @returns Array of meta tags for the home page
 */
export const meta: MetaFunction = () => {
  return [
    { title: "Home | SJK Signout" },
    {
      name: "description",
      content: "Web App for tracking inventory for item sign-outs",
    },
  ];
};

/**
 * Loader function to fetch dashboard data
 * Loads recent loans, inventory stats, and analytics data in parallel for optimal performance
 * Uses caching to reduce database load for frequently accessed dashboard data
 * @returns Deferred promise with dashboard data
 */
export const loader = async () => {
  // Execute all database queries in parallel with caching for better performance
  const [recentLoans, peopleWithLostItems, inventory, totalOutstanding, loansByYear] =
    await Promise.all([
      // Recent loans - get all non-returned statuses to match outstanding count logic
      getLoans(
        {
          statuses: ["out"],
          sortBy: ["createdDate"],
          order: ["desc"],
        },
        MAX_RECENT_ITEMS
      ),

      // Cache other dashboard data for 5 minutes as it changes less frequently
      getPeopleWithInvalidItems(),
      getItemsGroupedByType(),
      getTotalOutstandingLoans(),
      cache.getOrSet(
        CACHE_KEYS.LOANS_BY_YEAR,
        () => groupLoansByYear(),
        10 * 60 * 1000 // 10 minutes (historical data changes less frequently)
      ),
    ]);

  // Check for any errors from the parallel operations
  const errors = [
    recentLoans.error,
    peopleWithLostItems.error,
    inventory.error,
    totalOutstanding.error,
    loansByYear.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0] || "An error occurred while loading dashboard data");
  }

  return typeddefer({
    recentLoans: recentLoans.data,
    peopleWithLostItems: peopleWithLostItems.data,
    peopleWithLostItemsTotalCount: peopleWithLostItems.totalCount,
    inventory: inventory.data,
    loansByYear: loansByYear.data,
    totalOutstanding: totalOutstanding.data,
  });
};

/**
 * Home page component that renders the main dashboard
 * Displays overview statistics, recent activity, and quick navigation
 *
 * @returns The rendered home page dashboard
 */
export default function Index() {
  const navigate = useNavigate();
  const data = useTypedLoaderData<typeof loader>();

  // Check individual data loading states for progressive loading
  const hasRecentLoans = data?.recentLoans !== undefined;
  const hasPeopleData = data?.peopleWithLostItems !== undefined;
  const hasInventoryData = data?.inventory !== undefined;
  const hasTotalOutstanding = data?.totalOutstanding !== undefined;
  const hasLoansData = data?.loansByYear !== undefined;

  // Check if all critical data is loaded for main layout decision
  const isDataLoaded = data && hasRecentLoans && hasTotalOutstanding && hasInventoryData;

  let totalAvailableItems = 0;
  if (isDataLoaded && data.inventory?.itemByTypes) {
    data.inventory.itemByTypes.forEach((i) => {
      totalAvailableItems += i.statusCount["returned"];
    });
  }

  const today = dayjs();

  const dataToday = data.loansByYear?.find((l) => today.format("YYYY-MM-DD") === l.date) ?? {
    date: today.format("YYYY-MM-DD"),
    totalLoans: 0,
    totalReturns: 0,
  };

  return (
    <Flex
      w="100%"
      h={{ base: "100%", md: "100%" }}
      mih={{ base: 800, md: 600 }}
      direction="column"
      wrap="nowrap"
      gap="sm"
      p="md"
      pos="relative"
    >
      <Text ta="center">
        Welcome to the SJK Signout App!
        <br />
        <br /> This is a web app for tracking inventory for item sign-outs. You can use the sidebar
        to navigate to different pages.
      </Text>
      {!isDataLoaded ? (
        <>
          {/* Desktop skeleton */}
          <Box visibleFrom="md">
            <DesktopDashboardSkeleton />
          </Box>
          {/* Mobile skeleton */}
          <Box hiddenFrom="md">
            <MobileDashboardSkeleton />
          </Box>
        </>
      ) : (
        <>
          {/* Desktop Layout */}
          <Box visibleFrom="md" flex={1}>
            <Group w="100%" h="70%" grow>
              <Card h="100%" withBorder>
                <Card.Section inheritPadding withBorder>
                  {hasTotalOutstanding ? (
                    <StatView
                      h={100}
                      label="Outstanding Loans"
                      caption="Loans that are currently outstanding"
                      value={data.totalOutstanding ?? 0}
                    />
                  ) : (
                    <StatViewSkeleton />
                  )}
                </Card.Section>
                <Card.Section h="calc(100% - 70px)">
                  {hasRecentLoans ? (
                    <LoanList
                      data={data.recentLoans}
                      initialItemsPerPage={MAX_RECENT_ITEMS}
                      totalCount={data.recentLoans?.length}
                      withSearch={false}
                      showPagination={false}
                      w="100%"
                      h="100%"
                      withinParent
                    />
                  ) : (
                    <Stack gap="xs" p="sm">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Group key={index} justify="space-between" align="center" p="xs">
                          <Stack gap="xs" flex={1}>
                            <Skeleton h={16} w="70%" />
                            <Skeleton h={12} w="50%" />
                          </Stack>
                          <Skeleton h={20} w={60} />
                        </Group>
                      ))}
                    </Stack>
                  )}
                </Card.Section>
              </Card>
              <Card h="100%" withBorder>
                <Card.Section inheritPadding withBorder>
                  {hasPeopleData ? (
                    <StatView
                      h={100}
                      label="People with Problem Items"
                      caption="People who have lost, damaged, or unknown status items"
                      value={data.peopleWithLostItemsTotalCount ?? 0}
                    />
                  ) : (
                    <StatViewSkeleton />
                  )}
                </Card.Section>
                <Card.Section h="calc(100% - 70px)">
                  {hasPeopleData ? (
                    <PeopleList
                      data={data.peopleWithLostItems}
                      initialItemsPerPage={MAX_RECENT_ITEMS}
                      totalCount={data.peopleWithLostItemsTotalCount}
                      withSearch={false}
                      w="100%"
                      h="100%"
                      withinParent
                    />
                  ) : (
                    <Stack gap="xs" p="sm">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Group key={index} justify="space-between" align="center" p="xs">
                          <Stack gap="xs" flex={1}>
                            <Skeleton h={16} w="80%" />
                            <Skeleton h={12} w="60%" />
                          </Stack>
                          <Skeleton h={16} w={40} />
                        </Group>
                      ))}
                    </Stack>
                  )}
                </Card.Section>
              </Card>
              <Card h="100%" withBorder>
                <Card.Section inheritPadding withBorder>
                  {hasInventoryData ? (
                    <StatView
                      h={100}
                      label="Available Items"
                      caption="Number of Available Items"
                      value={totalAvailableItems}
                    />
                  ) : (
                    <StatViewSkeleton />
                  )}
                </Card.Section>
                <Card.Section h="calc(100% - 70px)">
                  {hasInventoryData ? (
                    <ListView
                      data={data.inventory?.itemByTypes?.map((i) => ({
                        ...i,
                        id: i.typeId,
                      }))}
                      initialItemsPerPage={data.inventory?.itemByTypes?.length}
                      totalCount={data.inventory?.itemByTypes?.length}
                      withSearch={false}
                      w="100%"
                      h="100%"
                      withinParent
                    >
                      {(type) => (
                        <UnstyledButton
                          className="list-item"
                          w="100%"
                          p="xs"
                          onClick={() => {
                            navigate(`/items/list?type=${type.type}`);
                          }}
                        >
                          <Group align="center" justify="space-between" grow>
                            <Text fw="bold" size="md" ta="center">
                              {type.type}
                            </Text>
                            <Text
                              size="sm"
                              ta="center"
                              {...(type.statusCount["returned"] === 0 && {
                                c: "red",
                              })}
                            >
                              {type.statusCount["returned"]} Available
                            </Text>
                          </Group>
                        </UnstyledButton>
                      )}
                    </ListView>
                  ) : (
                    <Stack gap="xs" p="sm">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Group key={index} justify="space-between" align="center" p="xs">
                          <Skeleton h={16} w="40%" />
                          <Skeleton h={12} w="30%" />
                        </Group>
                      ))}
                    </Stack>
                  )}
                </Card.Section>
              </Card>
            </Group>
            <Flex direction="row" wrap="nowrap" w="100%" h="25%" gap="md" mih={150} mt="md">
              <InfoView
                title="Loans in the Past Year"
                cardProps={{ flex: 1, h: "100%" }}
                rightSection={
                  <Text c="gray" ta="right">
                    {today.format("MMMM DD, YYYY")}
                  </Text>
                }
              >
                {!hasLoansData ? (
                  <Center h="100%">
                    <Stack align="center" gap="md">
                      <Loader size="md" />
                      <Text size="sm" c="dimmed">
                        Loading loan data...
                      </Text>
                    </Stack>
                  </Center>
                ) : data.loansByYear?.length === 0 ? (
                  <Center h="100%">
                    <Text ta="center">No loans in the past year</Text>
                  </Center>
                ) : (
                  <Suspense
                    fallback={
                      <Center h="100%">
                        <Loader size="md" />
                      </Center>
                    }
                  >
                    <AreaChart
                      w="100%"
                      h="100%"
                      withDots={false}
                      withTooltip={false}
                      mih={100}
                      data={
                        data.loansByYear?.map((l) => ({
                          date: l.date,
                          loaned: l.totalLoans,
                          returned: l.totalReturns,
                        })) ?? []
                      }
                      withXAxis={false}
                      withYAxis={false}
                      gridAxis="none"
                      dataKey="date"
                      series={[
                        { name: "loaned", label: "Loans", color: "red" },
                        {
                          name: "returned",
                          label: "Returns",
                          color: "green",
                        },
                      ]}
                      withLegend
                      curveType="linear"
                    />
                  </Suspense>
                )}
              </InfoView>
              <Stack h="100%" justify="space-between" w={200}>
                <Card withBorder flex={1}>
                  {hasLoansData ? (
                    <StatView label="Loans Today" value={dataToday.totalLoans} />
                  ) : (
                    <StatViewSkeleton />
                  )}
                </Card>
                <Card withBorder flex={1} mt="sm">
                  {hasLoansData ? (
                    <StatView label="Returns Today" value={dataToday.totalReturns} />
                  ) : (
                    <StatViewSkeleton />
                  )}
                </Card>
              </Stack>
            </Flex>
          </Box>

          {/* Mobile Layout */}
          <Box hiddenFrom="md" flex={1}>
            <Card withBorder>
              <Card.Section inheritPadding withBorder p="sm">
                {hasTotalOutstanding ? (
                  <StatView
                    label="Outstanding Loans"
                    caption="Loans that are currently outstanding"
                    value={data.totalOutstanding ?? 0}
                    onClick={() => {
                      navigate("/loans/list?status=out&status=lost&status=damaged&status=unknown");
                    }}
                  />
                ) : (
                  <StatViewSkeleton />
                )}
              </Card.Section>
              <Card.Section inheritPadding withBorder p="sm">
                {hasPeopleData ? (
                  <StatView
                    label="People with Problem Items"
                    caption="People who have lost, damaged, or unknown status items"
                    value={data.peopleWithLostItemsTotalCount ?? 0}
                    onClick={() => {
                      navigate("/people");
                    }}
                  />
                ) : (
                  <StatViewSkeleton />
                )}
              </Card.Section>
              <Card.Section inheritPadding withBorder p="sm">
                {hasInventoryData ? (
                  <StatView
                    label="Items Available"
                    caption="Number of Available Items"
                    value={totalAvailableItems}
                    onClick={() => {
                      navigate("/items/list?status=available");
                    }}
                  />
                ) : (
                  <StatViewSkeleton />
                )}
              </Card.Section>
            </Card>
            <Box mt="md">
              <InfoView
                title="Loans in the Past Year"
                cardProps={{ w: "100%", mih: 150, flex: 1 }}
                rightSection={
                  <Text c="gray" ta="right">
                    {today.format("MMMM DD, YYYY")}
                  </Text>
                }
              >
                {!hasLoansData ? (
                  <Center h="100%">
                    <Stack align="center" gap="xs">
                      <Loader size="sm" />
                      <Text size="xs" c="dimmed">
                        Loading...
                      </Text>
                    </Stack>
                  </Center>
                ) : data.loansByYear?.length === 0 ? (
                  <Center h="100%">
                    <Text ta="center">No loans in the past year</Text>
                  </Center>
                ) : (
                  <Suspense
                    fallback={
                      <Center h="100%">
                        <Loader size="sm" />
                      </Center>
                    }
                  >
                    <Sparkline
                      w="100%"
                      h={50}
                      data={data.loansByYear?.map((l) => l.totalLoans) ?? []}
                      color="red"
                    />
                  </Suspense>
                )}
              </InfoView>
            </Box>
            <Group grow gap="xs" mt="sm">
              <Card withBorder>
                {hasLoansData ? (
                  <StatView
                    label="Loans Today"
                    value={dataToday.totalLoans}
                    onClick={() => navigate("/loans")}
                  />
                ) : (
                  <StatViewSkeleton />
                )}
              </Card>
              <Card withBorder>
                {hasLoansData ? (
                  <StatView
                    label="Returns Today"
                    value={dataToday.totalReturns}
                    onClick={() => navigate("/loans")}
                  />
                ) : (
                  <StatViewSkeleton />
                )}
              </Card>
            </Group>
          </Box>
        </>
      )}
    </Flex>
  );
}
