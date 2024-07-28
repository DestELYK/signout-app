import { AreaChart, Sparkline } from "@mantine/charts";
import {
  Button,
  Card,
  Center,
  Flex,
  Group,
  Loader,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import MonthCombobox from "~/components/MonthCombobox";
import StatView from "~/components/StatView";
import InfoView from "~/components/base/InfoView";
import { LoanList } from "~/components/loans/LoanList";
import { useDesktopOnly } from "~/lib/hooks";
import { getLoanByMonth } from "~/lib/loans.server";
import { prisma } from "~/lib/prisma.server";
import { IN_COLOR, MAX_RECENT_ITEMS, OUT_COLOR } from "~/utils/consts";
import { loanWithTagsAndItems } from "~/utils/types.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  //#region Loans by Month
  const loansByMonth = (await getLoanByMonth()).loansByMonth;
  //#endregion

  //#region Recent Loans

  const recentLoans = await prisma.loan.findMany({
    include: loanWithTagsAndItems.include,
    take: MAX_RECENT_ITEMS,
    orderBy: { createdDate: "desc" },
    ...(searchParams.has("recent") && {
      where: {
        items:
          searchParams.get("recent") === "outstanding"
            ? {
                some: { dateReturned: null },
              }
            : undefined,
      },
    }),
  });
  //#endregion

  return typedjson({
    loansByMonth: loansByMonth,
    recentLoans: recentLoans,
    totalLoans: await prisma.loan.count(),
    totalOutstandingLoans: await prisma.loan.count({
      where: { items: { some: { dateReturned: null } } },
    }),
    totalReturnedLoans: await prisma.loan.count({
      where: { items: { none: { dateReturned: null } } },
    }),
    totalOutstandingItems: await prisma.item.count({
      where: { loans: { some: { dateReturned: null } } },
    }),
  });
};

export default function Page() {
  const desktopOnly = useDesktopOnly();
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

  const loansInCurrentMonth = data.loansByMonth?.find(
    (month) => month.month === selectedMonth
  );

  const months = data.loansByMonth?.map((month) => month.month);

  return (
    <>
      {desktopOnly === undefined ? (
        <Center>
          <Loader />
        </Center>
      ) : desktopOnly ? (
        //#region Desktop
        <Flex
          w="100%"
          h="100%"
          direction="row"
          wrap="nowrap"
          gap="sm"
          visibleFrom="md"
        >
          <Stack miw={200} w="100%" h="100%">
            <Group w="100%" align="stretch" grow style={{ flexWrap: "nowrap" }}>
              <Card withBorder>
                <StatView label="Total Loans" value={data.totalLoans} />
              </Card>
              <Card w={120} withBorder>
                <StatView
                  label="Total Outstanding Loans"
                  value={data.totalOutstandingItems}
                  color={OUT_COLOR}
                />
              </Card>
            </Group>
            <InfoView
              title={`Loans in ${dayjs(selectedMonth, "MM-YYYY").format(
                "MMMM YYYY"
              )}`}
              headerProps={{ withBorder: true }}
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
                <>
                  <Flex
                    w="100%"
                    h="100%"
                    direction="row"
                    gap="sm"
                    justify="center"
                    align="center"
                  >
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
                    {
                      //#region Area Chart
                    }
                    <AreaChart
                      w="100%"
                      h="100%"
                      miw={{ lg: 300, md: 200 }}
                      mih={200}
                      p="sm"
                      data={loansInCurrentMonth.days.map(
                        ({ loanCount, returnCount }, day) => {
                          return {
                            date: dayjs(selectedMonth, "MM-YYYY")
                              .set("date", day + 1)
                              .format("DD"),
                            loaned: loanCount,
                            returned: returnCount,
                          };
                        }
                      )}
                      dotProps={{
                        r: 1,
                      }}
                      xAxisProps={{ axisLine: true }}
                      xAxisLabel="Day in Month"
                      yAxisProps={{ axisLine: true }}
                      dataKey="date"
                      series={[
                        { name: "loaned", label: "Loans", color: OUT_COLOR },
                        {
                          name: "returned",
                          label: "Returns",
                          color: IN_COLOR,
                        },
                      ]}
                      withLegend
                      curveType="linear"
                    />
                    {
                      //#endregion
                    }
                  </Flex>
                </>
              ) : (
                <Center h={300}>No data for this month</Center>
              )}
            </InfoView>
          </Stack>
          {
            //#region Recent Loans
          }
          <InfoView
            title={`Recent Loans`}
            headerProps={{ withBorder: true }}
            cardProps={{
              w: "auto",
              miw: { md: 300, lg: 350, xl: 400 },
            }}
            bottomSection={
              <Stack gap="xs" mih={80}>
                <Text ta="center">
                  {data.totalOutstandingLoans} outstanding loans
                </Text>
                <Button component={Link} to="/loans/list?status=outstanding">
                  View All Outstanding Loans
                </Button>
              </Stack>
            }
            rightSection={
              <Switch
                label="Outstanding"
                color={OUT_COLOR}
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
            <Card.Section h="calc(100% - 20px)">
              <LoanList
                data={data.recentLoans}
                totalCount={data.recentLoans.length}
                withDetails={false}
                withSearch={false}
                initialItemsPerPage={MAX_RECENT_ITEMS}
              />
            </Card.Section>
          </InfoView>
          {
            //#endregion
          }
        </Flex>
      ) : (
        //#endregion
        //#region Mobile
        <Flex
          w="100%"
          mih={400}
          h="100%"
          pos="relative"
          direction="column"
          wrap="nowrap"
          gap="sm"
          hiddenFrom="md"
        >
          <Group
            w="100%"
            h={100}
            align="stretch"
            grow
            style={{ flexWrap: "nowrap" }}
          >
            <Card withBorder>
              <StatView label="Total Loans" value={data.totalLoans} />
            </Card>
            <Card w={120} withBorder>
              <StatView
                label="Total Outstanding Loans"
                value={data.totalOutstandingItems}
                color={OUT_COLOR}
              />
            </Card>
          </Group>
          <InfoView
            title={`Loans in ${dayjs(selectedMonth, "MM-YYYY").format(
              "MMMM YYYY"
            )}`}
            headerProps={{ withBorder: true }}
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
                    color={OUT_COLOR}
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
                    color={IN_COLOR}
                    data={loansInCurrentMonth.days.map(
                      (day) => day.returnCount
                    )}
                  />
                  <StatView
                    orientation="vertical"
                    label="Returned"
                    value={loansInCurrentMonth.totalReturns}
                  />
                </Stack>
              </Flex>
            ) : (
              <Center h={300}>No data for this month</Center>
            )}
          </InfoView>

          <Stack gap="xs" mih={80} mt="auto">
            <Text ta="center">
              {data.totalOutstandingLoans} outstanding loans
            </Text>
            <Button component={Link} to="/loans/list?status=outstanding">
              View All Outstanding Loans
            </Button>
          </Stack>
        </Flex>
        //#endregion
      )}
    </>
  );
}
