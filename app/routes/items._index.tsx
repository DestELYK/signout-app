import { BarChart } from "@mantine/charts";
import {
  Box,
  Center,
  Flex,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useNavigate, useNavigation } from "@remix-run/react";
import { IconChevronRight } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import StatCard from "~/components/StatCard";
import InfoView from "~/components/base/InfoView";
import ListView from "~/components/base/ListView";
import ItemList from "~/components/items/ItemList";
import { useDesktopOnly } from "~/lib/hooks";
import { getInvalidItems, getItemTypes } from "~/lib/items.server";
import { prisma } from "~/lib/prisma.server";
import { IN_COLOR, OUT_COLOR } from "~/utils/consts";

export const loader = async () => {
  const itemTypes = await getItemTypes();
  const invalidItems = await getInvalidItems();

  console.log(itemTypes, invalidItems);

  return typedjson({
    itemsByType: itemTypes.itemsByType,
    itemTypes: itemTypes.itemTypes,
    itemStatuses: invalidItems.statusCount,
    totalItems: await prisma.item.count(),
    outstandingItems: await prisma.item.count({
      where: { loans: { some: { dateReturned: null } } },
    }),
    invalidItems: invalidItems.invalidItems,
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
              <ItemList
                data={data.invalidItems?.map((item) => ({
                  id: item.id,
                  name: item.name,
                  tags: [item.status],
                  lastLoan: {
                    ...item.lastLoan,
                    loanedDate: item.lastLoan.date,
                  },
                }))}
                totalCount={data.invalidItems?.length}
                withSearch={false}
                initialItemsPerPage={20}
                showPagination={false}
              />
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
          <ScrollArea
            w="100%"
            type="scroll"
            scrollbars="x"
            offsetScrollbars="x"
          >
            <Flex
              h={100}
              direction="row"
              wrap="nowrap"
              gap="md"
              justify="center"
            >
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
            </Flex>
          </ScrollArea>

          <InfoView
            title="Current Inventory"
            headerProps={{ withBorder: true }}
          >
            <ListView
              data={
                data.itemsByType?.map((i) => ({ id: i.typeId, ...i })) ?? []
              }
              withSearch={false}
              showPagination={false}
            >
              {({ type, available, outstanding }) => (
                <UnstyledButton
                  w="100%"
                  onClick={() => navigate(`/items/list?type=${type}`)}
                >
                  <Group
                    w="100%"
                    justify="space-between"
                    onClick={() => navigate(`/items/list?type=${type}`)}
                    p="xs"
                  >
                    <Title order={5}>{type}</Title>
                    <Group>
                      <Stack gap={0}>
                        <Text c={IN_COLOR}>{available} available</Text>
                        <Text c={OUT_COLOR}>{outstanding} outstanding</Text>
                      </Stack>
                      <IconChevronRight />
                    </Group>
                  </Group>
                </UnstyledButton>
              )}
            </ListView>
          </InfoView>
        </Flex>
        //#endregion
      )}
    </>
  );
}
