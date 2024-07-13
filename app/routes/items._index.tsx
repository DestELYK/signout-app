import { BarChart } from "@mantine/charts";
import {
  ActionIcon,
  Badge,
  Box,
  Center,
  Flex,
  Group,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import { Tag } from "@prisma/client";
import { Link, useNavigate, useNavigation } from "@remix-run/react";
import { IconChevronCompactRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import StatCard from "~/components/StatCard";
import InfoView from "~/components/base/InfoView";
import ListView from "~/components/base/ListView";
import ItemListView from "~/components/items/ItemListView";
import { useDesktopOnly } from "~/lib/hooks";
import { prisma } from "~/lib/prisma.server";
import { IN_COLOR, OUT_COLOR } from "~/utils/consts";
import { formatFullName } from "~/utils/utils";

export const loader = async () => {
  const allItems = await prisma.item.findMany({
    include: {
      loans: {
        select: {
          loanId: true,
          dateLoaned: true,
          dateReturned: true,
          loan: {
            select: {
              person: {
                include: {
                  tags: true,
                },
              },
            },
          },
        },
      },
      tags: true,
    },
  });

  //#region Items by Type

  let itemsByType: {
    typeId: number;
    type: string;
    available: number;
    outstanding: number;
    total: number;
    color: string;
  }[] = [];

  const types = await prisma.tag.findMany({
    where: { category: "Item Type", hidden: false },
    orderBy: [{ priority: "asc" }, { name: "asc" }],
  });

  const statuses = await prisma.tag.findMany({
    where: { category: "Item Status", hidden: false },
  });

  types.forEach((type) => {
    const available = allItems.filter(
      (item) =>
        item.tags.find((tag) => tag.id === type.id) &&
        item.loans.filter((loan) => loan.dateReturned === null).length === 0
    ).length;
    const outstanding = allItems.filter(
      (item) =>
        item.tags.find((tag) => tag.id === type.id) &&
        item.loans.filter((loan) => loan.dateReturned === null).length > 0
    ).length;

    itemsByType.push({
      typeId: type.id,
      type: type.name,
      available: available,
      outstanding: outstanding,
      total: available + outstanding,
      color: type.color,
    });
  });

  let statusCount: { [key: string]: { count: number; color: string } } = {};
  let invalidItems: {
    id: number;
    name: string;
    status: Tag;
    lastLoan: { id: number; personId: number; fullName: string; date: Date };
  }[] = [];

  statuses.forEach((status) => {
    statusCount[status.name] = {
      count: allItems.filter((item) =>
        item.tags.find((tag) => tag.id === status.id)
      ).length,
      color: status.color,
    };

    const invalid = allItems.filter(
      (item) =>
        item.tags.find((tag) => tag.id === status.id) &&
        item.loans.filter((loan) => loan.dateReturned === null).length > 0
    );

    for (let i = 0; i < invalid.length; i++) {
      const invalidItem = invalid[i];

      const lastLoan = invalidItem.loans.reduce((prev, current) =>
        prev.dateLoaned > current.dateLoaned ? prev : current
      );

      // Check if item already exists in the list
      const existingItem = invalidItems.find(
        (item) => item.id === invalidItem.id
      );

      if (existingItem) {
        continue;
      }

      invalidItems.push({
        id: invalidItem.id,
        name: invalidItem.name,
        status: status,
        lastLoan: {
          id: lastLoan.loanId,
          personId: lastLoan.loan.person.id,
          fullName: formatFullName(lastLoan.loan.person),
          date: lastLoan.dateLoaned,
        },
      });
    }
  });

  return typedjson({
    itemsByType: itemsByType,
    itemTypes: types,
    itemStatuses: statusCount,
    totalItems: await prisma.item.count(),
    outstandingItems: await prisma.item.count({
      where: { loans: { some: { dateReturned: null } } },
    }),
    invalidItems: invalidItems,
  });
};

export default function Page() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const desktopOnly = useDesktopOnly();

  const data = useTypedLoaderData<typeof loader>();

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
          h="calc(100dvh - 13rem)"
          direction="row"
          wrap="nowrap"
          gap="sm"
          visibleFrom="md"
        >
          <Stack w="100%" h="100%">
            <Group w="100%" grow style={{ flexWrap: "nowrap" }}>
              <StatCard
                label="Total Items"
                value={data.totalItems}
                cardProps={{ h: "100%" }}
              />
              <StatCard
                label="Total Outstanding Items"
                value={data.outstandingItems}
                color={OUT_COLOR}
                cardProps={{ w: 150, h: "100%" }}
                onClick={() => navigate("/items/list?status=outstanding")}
              />
              {data.itemStatuses &&
                Object.keys(data.itemStatuses).length > 0 &&
                Object.entries(data.itemStatuses).map(
                  ([status, { count, color }]) => (
                    <StatCard
                      key={status}
                      label={status}
                      value={count}
                      color={color}
                      cardProps={{ h: "100%" }}
                      onClick={() =>
                        navigate(
                          `/items/list?status=${status.toLocaleLowerCase()}`
                        )
                      }
                    />
                  )
                )}
            </Group>
            <InfoView
              title="Current Inventory"
              headerProps={{ withBorder: true }}
            >
              {data.itemsByType && data.itemsByType.length > 0 ? (
                <BarChart
                  miw={250}
                  mih={500}
                  orientation="vertical"
                  data={data.itemsByType.map(
                    ({ type, available, outstanding }) => ({
                      itemType: type,
                      available: available,
                      outstanding: outstanding,
                    })
                  )}
                  type="stacked"
                  dataKey="itemType"
                  barChartProps={{
                    barCategoryGap: 3,
                    outerRadius: 3,
                  }}
                  barProps={{
                    onClick: (data) => {
                      if ("itemType" in data) {
                        navigate(`/items/list?type=${data.itemType}`);
                      }
                    },
                    style: { cursor: "pointer" },
                  }}
                  gridAxis="y"
                  xAxisProps={{ allowDecimals: false, tickCount: 10 }}
                  yAxisProps={{ width: 120, interval: 0, axisLine: true }}
                  series={[
                    {
                      name: "available",
                      label: "Available",
                      color: IN_COLOR,
                    },
                    {
                      name: "outstanding",
                      label: "Outstanding",
                      color: OUT_COLOR,
                    },
                  ]}
                />
              ) : (
                <Center h={300}>No data</Center>
              )}
            </InfoView>
          </Stack>
          {
            //#region Invalid Items
          }
          <InfoView
            title={`Invalid Items`}
            headerProps={{ withBorder: true }}
            cardProps={{
              w: "auto",
              miw: { md: 300, lg: 350, xl: 400 },
            }}
          >
            <Box h="100%" w="100%" mih={300}>
              <ListView
                data={data.invalidItems}
                totalCount={data.invalidItems.length}
                loading={navigation.state === "loading"}
                withSearch={false}
                initialItemsPerPage={20}
                showPagination={false}
              >
                {(item) => (
                  <ItemListView
                    {...item}
                    lastLoan={{
                      ...item.lastLoan,
                      loanedDate: item.lastLoan.date,
                    }}
                    tags={[item.status]}
                  />
                )}
              </ListView>
            </Box>
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
          align="center"
          direction="column"
          wrap="nowrap"
          gap="sm"
          hiddenFrom="md"
        >
          <Group w="100%" h={100} grow style={{ flexWrap: "nowrap" }}>
            <StatCard
              label="Total Items"
              value={data.totalItems}
              cardProps={{ h: "100%" }}
            />
            <StatCard
              label="Total Outstanding Items"
              value={data.outstandingItems}
              color={OUT_COLOR}
              cardProps={{ w: 150, h: "100%" }}
            />
            {data.itemStatuses &&
              Object.keys(data.itemStatuses).length > 0 &&
              Object.entries(data.itemStatuses).map(
                ([status, { count, color }]) => (
                  <StatCard
                    key={status}
                    label={status}
                    value={count}
                    color={color}
                    cardProps={{ h: "100%" }}
                  />
                )
              )}
          </Group>
          <InfoView
            title="Current Inventory"
            headerProps={{ withBorder: true }}
          >
            <Box h={400} w="100%">
              <ListView
                data={
                  data.itemsByType?.map((i) => ({ id: i.typeId, ...i })) ?? []
                }
                withSearch={false}
                showPagination={false}
              >
                {({ type, available, outstanding }) => (
                  <Group justify="space-between">
                    <Text>{type}</Text>
                    <Stack gap={0}>
                      <Text c={IN_COLOR}>{available} available</Text>
                      <Text c={OUT_COLOR}>{outstanding} outstanding</Text>
                    </Stack>
                  </Group>
                )}
              </ListView>
            </Box>
          </InfoView>

          <InfoView title={`Invalid Items`} headerProps={{ withBorder: true }}>
            <Box h={400} w="100%">
              <ListView
                data={data.invalidItems}
                totalCount={data.invalidItems.length}
                loading={navigation.state === "loading"}
                withSearch={false}
                showPagination={false}
                initialItemsPerPage={20}
              >
                {(item) => (
                  <Group>
                    <Stack w="100%">
                      <Group w="100%">
                        <Text>{item.name}</Text>
                        <Badge color={item.status.color}>
                          {item.status.name}
                        </Badge>
                      </Group>
                      <Text>
                        Last loaned by{" "}
                        <Link
                          to={`/people/${item.lastLoan.personId}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {item.lastLoan.fullName}
                        </Link>{" "}
                        on {dayjs(item.lastLoan.date).format("DD MMM YYYY")}
                      </Text>
                    </Stack>
                    <ActionIcon
                      size="md"
                      onClick={() => navigate(`/items/${item.id}`)}
                    >
                      <IconChevronCompactRight />
                    </ActionIcon>
                  </Group>
                )}
              </ListView>
            </Box>
          </InfoView>
        </Flex>
        //#endregion
      )}
    </>
  );
}
