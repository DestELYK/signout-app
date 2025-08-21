/**
 * Loans overview dashboard displaying loan analytics and statistics
 *
 * This route provides the main loans dashboard with:
 * - loan statistics and analytics
 * - Interactive charts for loan trends by month
 * - Recent loans display with filtering options
 * - Outstanding loans tracking and monitoring
 * - Responsive layout with desktop and mobile views
 *
 * @requires @mantine/charts for loan analytics visualization
 * @requires LoanList component for recent loans display
 * @requires StatView for statistics presentation
 *
 * @module routes/loans/index
 *
 * @author Kyle Dunn
 */

import { AreaChart, Sparkline } from "@mantine/charts";
import {
  Box,
  Button,
  Card,
  Center,
  Flex,
  Group,
  Skeleton,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import InfoView from "~/components/base/InfoView";
import { LoanList } from "~/components/loans/LoanList";
import MonthCombobox from "~/components/MonthCombobox";
import StatView from "~/components/StatView";
import { cache, CACHE_KEYS } from "~/lib/cache.server";
import { getLoans, groupLoansByMonth } from "~/lib/loans.server";
import { prisma } from "~/lib/prisma.server";
import { MAX_RECENT_ITEMS } from "~/utils/consts";

/**
 * Server-side loader function for loans dashboard
 * Fetches comprehensive loan analytics and recent loan data
 *
 * @param request - The incoming request with search parameters
 * @returns JSON response with loan statistics, charts data, and recent loans
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  // Execute all queries in parallel with caching for better performance
  const [loansByMonth, recentLoans, loansStats] = await Promise.all([
    // Cache loans by month for 5 minutes (historical data)
    cache.getOrSet(
      CACHE_KEYS.LOANS_BY_MONTH,
      () => groupLoansByMonth().then((result) => result.data),
      5 * 60 * 1000 // 5 minutes
    ),

    // Recent loans are not cached as they change frequently and users expect real-time data
    getLoans(
      {
        statuses: searchParams.get("recent") === "outstanding" ? ["out"] : undefined,
        sortBy: ["createdDate"],
        order: ["desc"],
      },
      MAX_RECENT_ITEMS
    ),

    // Cache statistics for 3 minutes
    cache.getOrSet(
      CACHE_KEYS.LOANS_STATS,
      async () => {
        const [totalLoans, totalOutstandingLoans, totalReturnedLoans, totalOutstandingItems] =
          await Promise.all([
            prisma.loan.count(),
            prisma.loan.count({
              where: { items: { some: { status: "out" } } },
            }),
            prisma.loan.count({
              where: { items: { every: { status: "returned" } } },
            }),
            prisma.item.count({
              where: { loans: { some: { status: "out" } } },
            }),
          ]);

        return {
          totalLoans,
          totalOutstandingLoans,
          totalReturnedLoans,
          totalOutstandingItems,
        };
      },
      3 * 60 * 1000 // 3 minutes
    ),
  ]);

  return typedjson({
    loansByMonth,
    recentLoans,
    ...loansStats,
  });
};

export default function Page() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewOutstanding, setViewOutstanding] = useState<boolean>(false);

  const outstanding = searchParams.get("recent");

  useEffect(() => {
    setViewOutstanding(outstanding != null && outstanding === "outstanding");
  }, [outstanding]);

  const data = useTypedLoaderData<typeof loader>();

  const currentMonth = dayjs().format("MM-YYYY");

  const selectedMonth = searchParams.has("month")
    ? searchParams.get("month")
    : dayjs().format("MM-YYYY");

  const loansInCurrentMonth = data.loansByMonth?.find((month) => month.month === selectedMonth);

  const months = data.loansByMonth?.map((month) => month.month);

  const today = loansInCurrentMonth?.days[dayjs().date() - 1];

  return (
    <>
      {data === undefined ? (
        <Box w="100%" h="100%" pos="relative" p="sm">
          <Skeleton w="100%" h="100%" />
        </Box>
      ) : (
        <>
          {/* Desktop Layout */}
          <Flex
            w="100%"
            h="100%"
            direction="row"
            wrap="nowrap"
            gap="sm"
            visibleFrom="md"
            pos="relative"
            p="sm"
          >
            <Stack w={{ md: "60%", lg: "65%" }} h="100%">
              <Group w="100%" align="stretch" grow style={{ flexWrap: "nowrap" }}>
                <Card withBorder>
                  <StatView label="Total Loans" value={data.totalLoans} />
                </Card>
                <Card w={120} withBorder>
                  <StatView
                    label="Total Outstanding Loans"
                    value={data.totalOutstandingItems}
                    color="red"
                  />
                </Card>
              </Group>
              <InfoView
                title={`Loans in ${dayjs(selectedMonth, "MM-YYYY").format("MMMM YYYY")}`}
                rightSection={
                  <MonthCombobox
                    months={months}
                    value={selectedMonth}
                    onChange={(value) =>
                      setSearchParams(
                        (prev) => {
                          if (value === currentMonth) prev.delete("month");
                          else prev.set("month", value);
                          return prev;
                        },
                        { replace: true }
                      )
                    }
                  />
                }
              >
                {loansInCurrentMonth ? (
                  <Flex w="100%" h="100%" direction="row" gap="sm" justify="center" align="center">
                    <Stack visibleFrom="lg">
                      <StatView
                        orientation="horizontal"
                        label="Loans"
                        value={loansInCurrentMonth.totalLoans}
                      />
                      <StatView
                        orientation="horizontal"
                        label="Returned"
                        value={loansInCurrentMonth.totalReturns}
                      />
                    </Stack>
                    <Stack hiddenFrom="lg">
                      <StatView
                        orientation="vertical"
                        label="Loans"
                        value={loansInCurrentMonth.totalLoans}
                      />
                      <StatView
                        orientation="vertical"
                        label="Returned"
                        value={loansInCurrentMonth.totalReturns}
                      />
                    </Stack>
                    <AreaChart
                      w="100%"
                      h="calc(100% - 20px)"
                      miw={{ lg: 300, md: 200 }}
                      mih={200}
                      p="sm"
                      data={loansInCurrentMonth.days.map(({ loanCount, returnCount }, day) => {
                        return {
                          date: dayjs(selectedMonth, "MM-YYYY")
                            .set("date", day + 1)
                            .format("DD"),
                          loaned: loanCount,
                          returned: returnCount,
                        };
                      })}
                      dotProps={{
                        r: 1,
                      }}
                      xAxisProps={{ axisLine: true }}
                      xAxisLabel="Day in Month"
                      yAxisProps={{ axisLine: true }}
                      dataKey="date"
                      series={[
                        {
                          name: "loaned",
                          label: "Loans",
                          color: "red",
                        },
                        {
                          name: "returned",
                          label: "Returns",
                          color: "green",
                        },
                      ]}
                      withLegend
                      curveType="linear"
                    />
                  </Flex>
                ) : (
                  <Center h="100%">No data for this month</Center>
                )}
              </InfoView>
              <Group grow align="stretch" style={{ flexWrap: "nowrap" }}>
                <Card withBorder>
                  <StatView label="Loans Today" value={today?.loanCount ?? 0} color="red" />
                </Card>
                <Card withBorder>
                  <StatView label="Returns Today" value={today?.returnCount ?? 0} color="green" />
                </Card>
              </Group>
            </Stack>
            <InfoView
              title={`Recent Loans`}
              cardProps={{
                w: { md: "40%", lg: "35%" },
                padding: 0,
              }}
              bottomSection={
                <Stack gap="xs" mih={80}>
                  <Text ta="center">{data.totalOutstandingLoans} outstanding loans</Text>
                  <Button component={Link} to="/loans/list?status=out">
                    View All Outstanding Loans
                  </Button>
                </Stack>
              }
              rightSection={
                <Switch
                  label="Outstanding"
                  color="red"
                  labelPosition="left"
                  checked={viewOutstanding}
                  onChange={(value) => {
                    if (value.currentTarget.checked !== viewOutstanding) {
                      setSearchParams(
                        (prev) => {
                          if (!value.currentTarget.checked) prev.delete("recent");
                          else prev.set("recent", "outstanding");

                          return prev;
                        },
                        { replace: true }
                      );
                    }
                  }}
                />
              }
            >
              {data.recentLoans.error ? (
                <Center h="100%">
                  <Text c="error">{data.recentLoans.error}</Text>
                </Center>
              ) : (
                <LoanList
                  data={data.recentLoans.data ?? []}
                  totalCount={data.recentLoans.data?.length ?? 0}
                  withDetails={false}
                  withSearch={false}
                  initialItemsPerPage={MAX_RECENT_ITEMS}
                  w="100%"
                  h="100%"
                  withinParent
                />
              )}
            </InfoView>
          </Flex>

          {/* Mobile Layout */}
          <Flex
            w="100%"
            h="100%"
            align="center"
            direction="column"
            wrap="nowrap"
            gap="sm"
            hiddenFrom="md"
            p="sm"
          >
            <Group w="100%" h={100} align="stretch" grow style={{ flexWrap: "nowrap" }}>
              <Card withBorder>
                <StatView label="Total Loans" value={data.totalLoans} />
              </Card>
              <Card w={120} withBorder>
                <StatView
                  label="Total Outstanding Loans"
                  value={data.totalOutstandingItems}
                  color="red"
                />
              </Card>
            </Group>
            <InfoView
              title={`Loans in ${dayjs(selectedMonth, "MM-YYYY").format("MMMM YYYY")}`}
              rightSection={
                <MonthCombobox
                  months={months}
                  value={selectedMonth}
                  onChange={(value) =>
                    setSearchParams(
                      (prev) => {
                        prev.set("month", value);
                        return prev;
                      },
                      { replace: true }
                    )
                  }
                />
              }
              cardProps={{ mih: 200, mah: 200 }}
            >
              {loansInCurrentMonth ? (
                <Flex
                  w="100%"
                  h="100%"
                  direction="row"
                  gap="sm"
                  justify="space-around"
                  align="center"
                >
                  <Stack>
                    <Sparkline
                      w={100}
                      h={50}
                      color="red"
                      data={loansInCurrentMonth.days.map((day) => day.loanCount)}
                    />
                    <StatView
                      orientation="vertical"
                      label="Loans"
                      value={loansInCurrentMonth.totalLoans}
                    />
                  </Stack>
                  <Stack>
                    <Sparkline
                      w={100}
                      h={50}
                      color="green"
                      data={loansInCurrentMonth.days.map((day) => day.returnCount)}
                    />
                    <StatView
                      orientation="vertical"
                      label="Returned"
                      value={loansInCurrentMonth.totalReturns}
                    />
                  </Stack>
                </Flex>
              ) : (
                <Center w="100%" h="100%" mt={50}>
                  No data for this month
                </Center>
              )}
            </InfoView>

            <Stack gap="xs" mih={80} mt="auto">
              <Text ta="center">{data.totalOutstandingLoans} outstanding loans</Text>
              <Button component={Link} to="/loans/list?status=out">
                View All Outstanding Loans
              </Button>
            </Stack>
          </Flex>
        </>
      )}
    </>
  );
}
