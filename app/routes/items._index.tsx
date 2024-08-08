import { BarChart } from "@mantine/charts";
import {
    Card,
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
import StatView from "~/components/StatView";
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
                <Stack w="100%" h="100%" justify="center" align="center">
                    <Loader />
                    <Text className="loading-text">Loading</Text>
                </Stack>
            ) : desktopOnly ? (
                //#region Desktop
                <Flex w="100%" h="100%" direction="row" wrap="nowrap" gap="sm" visibleFrom="md">
                    <Stack w="100%" h="100%">
                        <Group w="100%" align="stretch" grow style={{ flexWrap: "nowrap" }}>
                            <Card withBorder>
                                <StatView label="Total Items" value={data.totalItems} />
                            </Card>
                            <Card withBorder>
                                <StatView
                                    label="Total Outstanding Items"
                                    value={data.outstandingItems}
                                    color={OUT_COLOR}
                                    onClick={() => navigate("/items/list?status=outstanding")}
                                />
                            </Card>
                            {data.itemStatuses &&
                                Object.keys(data.itemStatuses).length > 0 &&
                                Object.entries(data.itemStatuses).map(
                                    ([status, { count, color }]) => (
                                        <Card key={status} withBorder>
                                            <StatView
                                                label={status}
                                                value={count}
                                                color={color}
                                                onClick={() =>
                                                    navigate(
                                                        `/items/list?status=${status.toLocaleLowerCase()}`
                                                    )
                                                }
                                            />
                                        </Card>
                                    )
                                )}
                        </Group>
                        <InfoView title="Current Inventory">
                            {data.itemsByType && data.itemsByType.length > 0 ? (
                                <BarChart
                                    w="100%"
                                    h="100%"
                                    p="md"
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
                        cardProps={{
                            w: "auto",
                            padding: 0,
                            miw: { md: 300, lg: 350, xl: 400 },
                        }}
                    >
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
                    h="100%"
                    align="center"
                    direction="column"
                    wrap="nowrap"
                    gap="sm"
                    hiddenFrom="md"
                >
                    <ScrollArea w="100%" type="always" scrollbars="x" offsetScrollbars="x">
                        <Flex
                            h={100}
                            direction="row"
                            wrap="nowrap"
                            gap="md"
                            justify="center"
                            align="stretch"
                        >
                            <Card miw={150} withBorder>
                                <StatView label="Total Items" value={data.totalItems} />
                            </Card>
                            <Card miw={150} withBorder>
                                <StatView
                                    label="Total Outstanding Items"
                                    value={data.outstandingItems}
                                    color={OUT_COLOR}
                                />
                            </Card>
                            {data.itemStatuses &&
                                Object.keys(data.itemStatuses).length > 0 &&
                                Object.entries(data.itemStatuses).map(
                                    ([status, { count, color }]) => (
                                        <Card key={status} miw={150} withBorder>
                                            <StatView label={status} value={count} color={color} />
                                        </Card>
                                    )
                                )}
                        </Flex>
                    </ScrollArea>

                    <InfoView title="Current Inventory" cardProps={{ padding: 0 }}>
                        <ListView
                            data={data.itemsByType?.map((i) => ({ id: i.typeId, ...i })) ?? []}
                            withSearch={false}
                            showPagination={false}
                            withOffset={false}
                        >
                            {({ type, available, outstanding }) => (
                                <UnstyledButton
                                    w="100%"
                                    className="list-item"
                                    onClick={() => navigate(`/items/list?type=${type}`)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <Group w="100%" justify="space-between" p="xs">
                                        <Title maw={120} order={5}>
                                            {type}
                                        </Title>
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
