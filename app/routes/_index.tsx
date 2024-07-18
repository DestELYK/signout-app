import { AreaChart, Sparkline } from "@mantine/charts";
import { Box, Center, Flex, Group, Loader, Stack, Text } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import dayjs from "dayjs";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import StatCard from "~/components/StatCard";
import InfoView from "~/components/base/InfoView";
import ListView from "~/components/base/ListView";
import { LoanList } from "~/components/loans/LoanList";
import PeopleList from "~/components/people/PeopleList";
import { useDesktopOnly } from "~/lib/hooks";
import { getItemTypes } from "~/lib/items.server";
import { getLoans, getLoansByYear } from "~/lib/loans.server";
import { getPeopleWithInvalidItems } from "~/lib/people.server";
import { IN_COLOR, MAX_RECENT_ITEMS, OUT_COLOR } from "~/utils/consts";

export const meta: MetaFunction = () => {
  return [
    { title: "Home | SJK Signout" },
    {
      name: "description",
      content: "Web App for tracking inventory for item sign-outs",
    },
  ];
};

export const loader = async () => {
  const recentLoans = await getLoans({}, MAX_RECENT_ITEMS);
  const peopleWithInvalidItems = await getPeopleWithInvalidItems();
  const inventory = await getItemTypes();

  const loansByYear = await getLoansByYear();

  return typedjson({
    recentLoans: recentLoans.loans,
    peopleWithInvalidItems: peopleWithInvalidItems.peopleWithInvalidItems,
    inventory: inventory.itemsByType,
    loansByYear: loansByYear.loansByYear,
    totalOutstanding: await prisma.loan.count({
      where: {
        items: {
          some: {
            dateReturned: null,
          },
        },
      },
    }),
    totalInvalidItems: peopleWithInvalidItems.peopleWithInvalidItems?.length,
  });
};

export default function Index() {
  const navigate = useNavigate();
  const data = useTypedLoaderData<typeof loader>();

  const desktopOnly = useDesktopOnly();

  let totalAvailableItems = 0;
  data.inventory?.forEach((i) => {
    totalAvailableItems += i.available;
  });

  const today = dayjs();

  const dataToday = data.loansByYear?.find(
    (l) => today.format("YYYY-MM-DD") === l.date
  ) ?? {
    date: today.format("YYYY-MM-DD"),
    totalLoans: 0,
    totalReturns: 0,
  };

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
          mih={600}
          h="calc(100dvh - 3.8rem)"
          direction="column"
          wrap="nowrap"
          gap="sm"
          visibleFrom="md"
          p="md"
        >
          <Text>
            Welcome to the SJK Signout App! This is a web app for tracking
            inventory for item sign-outs. You can use the navigation bar along
            the sidebar to navigate to different pages.
          </Text>
          <Group w="100%" h="70%" grow>
            <Stack h="100%" gap={0}>
              <StatCard
                label="Total Outstanding"
                caption="Loans that are currently outstanding"
                value={data.totalOutstanding}
                cardProps={{ mih: "25%" }}
              />
              <Box h="75%">
                <LoanList
                  data={data.recentLoans}
                  initialItemsPerPage={MAX_RECENT_ITEMS}
                  totalCount={data.recentLoans?.length}
                  withSearch={false}
                />
              </Box>
            </Stack>
            <Stack h="100%" gap={0}>
              <StatCard
                label="People with Invalid Items"
                caption="People who have invalid items (broken, lost, etc.)"
                value={data.totalInvalidItems ?? 0}
                cardProps={{ mih: "25%" }}
              />
              <Box h="75%">
                <PeopleList
                  data={data.peopleWithInvalidItems}
                  initialItemsPerPage={MAX_RECENT_ITEMS}
                  totalCount={data.recentLoans?.length}
                  withSearch={false}
                />
              </Box>
            </Stack>
            <Stack h="100%" gap={0}>
              <StatCard
                label="Total Available Items"
                caption="Number of Available Items"
                value={totalAvailableItems}
                cardProps={{ mih: "25%" }}
              />
              <Box h="75%">
                <ListView
                  data={data.inventory?.map((i) => ({
                    ...i,
                    id: i.typeId,
                  }))}
                  initialItemsPerPage={data.inventory?.length}
                  totalCount={data.inventory?.length}
                  withSearch={false}
                >
                  {(type) => (
                    <Group
                      w="100%"
                      align="center"
                      justify="space-between"
                      grow
                      p="xs"
                    >
                      <Text
                        ta="center"
                        {...(type.available === 0 && { c: "red" })}
                      >
                        {type.type}
                      </Text>
                      <Text
                        ta="center"
                        {...(type.available === 0 && { c: "red" })}
                      >
                        {type.available} Available
                      </Text>
                    </Group>
                  )}
                </ListView>
              </Box>
            </Stack>
          </Group>
          <Flex direction="row" wrap="nowrap" w="100%" h={180} gap="sm">
            <InfoView
              title="Loans in the Past Year"
              cardProps={{ w: "100%", h: "100%" }}
              headerProps={{ withBorder: true }}
              rightSection={
                <Text c="gray" ta="right">
                  {today.format("MMMM DD, YYYY")}
                </Text>
              }
            >
              <AreaChart
                w="100%"
                h="100%"
                mih={100}
                data={
                  data.loansByYear?.map((l) => ({
                    date: l.date,
                    loaned: l.totalLoans,
                    returned: l.totalReturns,
                  })) ?? []
                }
                dotProps={{
                  r: 1,
                }}
                withXAxis={false}
                withYAxis={false}
                gridAxis="none"
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
            </InfoView>
            <Stack h="100%">
              <StatCard label="Loans Today" value={dataToday.totalLoans} />
              <StatCard label="Returns Today" value={dataToday.totalReturns} />
            </Stack>
          </Flex>
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
          p="md"
        >
          <Text>
            Welcome to the SJK Signout App! This is a web app for tracking
            inventory for item sign-outs. You can use the top left icon to
            navigate to different pages.
          </Text>
          <Stack gap={0}>
            <StatCard
              label="Total Outstanding"
              caption="Loans that are currently outstanding"
              value={data.totalOutstanding}
              onClick={() => {
                navigate("/loans/list?status=outstanding");
              }}
            />
          </Stack>
          <StatCard
            label="People with Invalid Items"
            caption="People who have invalid items (broken, lost, etc.)"
            value={data.totalInvalidItems ?? 0}
            onClick={() => {
              navigate("/people");
            }}
          />
          <StatCard
            label="Total Available Items"
            caption="Number of Available Items"
            value={totalAvailableItems}
            onClick={() => {
              navigate("/items/list?status=available");
            }}
          />

          <InfoView
            title="Loans in the Past Year"
            headerProps={{ withBorder: true }}
            cardProps={{ w: "100%", h: 130 }}
            rightSection={
              <Text c="gray" ta="right">
                {today.format("MMMM DD, YYYY")}
              </Text>
            }
          >
            <Sparkline
              w="100%"
              h={50}
              data={data.loansByYear?.map((l) => l.totalLoans) ?? []}
              color={OUT_COLOR}
            />
          </InfoView>
          <Group grow>
            <StatCard
              label="Loans Today"
              value={dataToday.totalLoans}
              onClick={() => navigate("/loans")}
            />
            <StatCard
              label="Returns Today"
              value={dataToday.totalReturns}
              onClick={() => navigate("/loans")}
            />
          </Group>
        </Flex>
        //#endregion
      )}
    </>
  );
}
