import { BarChart } from "@mantine/charts";
import {
    Box,
    Card,
    Center,
    Flex,
    Group,
    ScrollArea,
    Skeleton,
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
import {
    getItemCount as getItemsCount,
    getItemsGroupedByType,
    getItemStatusCount,
    getOutstandingItemsCount,
} from "~/lib/items.server";

export const loader = async () => {
    const itemsByType = await getItemsGroupedByType();
    const invalidItems = await getItemStatusCount();
    const totalItems = await getItemsCount();
    const outstandingItems = await getOutstandingItemsCount();

    if (itemsByType.error || invalidItems.error || totalItems.error || outstandingItems.error) {
        throw new Error(
            itemsByType.error || invalidItems.error || totalItems.error || outstandingItems.error
        );
    }

    return typedjson({
        itemsByType: itemsByType.data,
        itemStatuses: invalidItems.data,
        totalItems: totalItems.data,
        outstandingItems: outstandingItems.data,
        invalidItems: invalidItems.data,
    });
};

export default function Page() {
    const navigate = useNavigate();
    const navigation = useNavigation();
    const desktopOnly = useDesktopOnly();

    const data = useTypedLoaderData<typeof loader>();

    return (
        <>
            {desktopOnly === undefined || data === undefined ? (
                <Box w="100%" h="100%" pos="relative" p="sm">
                    <Skeleton w="100%" h="100%" />
                </Box>
            ) : desktopOnly ? (
                //#region Desktop
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
                                <StatView label="Total Items" value={data.totalItems ?? 0} />
                            </Card>
                            {data.itemStatuses?.statusCount &&
                                Object.keys(data.itemStatuses?.statusCount).length > 0 &&
                                Object.entries(data.itemStatuses?.statusCount).map(
                                    ([status, { name, count, color }]) => (
                                        <Card key={status} withBorder>
                                            <StatView
                                                label={name}
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
                            {data.itemsByType?.itemByTypes &&
                            data.itemsByType.itemByTypes.length > 0 ? (
                                <BarChart
                                    w="100%"
                                    h="100%"
                                    p="sm"
                                    orientation="vertical"
                                    data={data.itemsByType.itemByTypes.map((i) => ({
                                        itemType: i.type,
                                        available: i.statusCount["returned"],
                                        out:
                                            i.statusCount["out"] +
                                            i.statusCount["lost"] +
                                            i.statusCount["unknown"],
                                    }))}
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
                                            color: "green",
                                            label: "Available",
                                        },
                                        {
                                            name: "out",
                                            color: "red",
                                            label: "Outstanding",
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
                            w: { md: "40%", lg: "35%" },
                            h: "100%",
                            padding: 0,
                            pos: "relative",
                        }}
                    >
                        <ItemList
                            data={data.invalidItems?.items ?? []}
                            totalCount={data.invalidItems?.items.length ?? 0}
                            withSearch={false}
                            initialItemsPerPage={20}
                            showPagination={false}
                            withinParent
                            w="100%"
                            h="100%"
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
                    align="center"
                    direction="column"
                    wrap="nowrap"
                    gap="sm"
                    hiddenFrom="md"
                    p="sm"
                >
                    <Box w="100%" pos="relative">
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
                                    <StatView label="Total Items" value={data.totalItems ?? 0} />
                                </Card>
                                {data.itemStatuses?.statusCount &&
                                    Object.keys(data.itemStatuses.statusCount).length > 0 &&
                                    Object.entries(data.itemStatuses.statusCount).map(
                                        ([status, { count, name, color }]) => (
                                            <Card key={status} miw={150} withBorder>
                                                <StatView
                                                    label={name}
                                                    value={count}
                                                    color={color}
                                                />
                                            </Card>
                                        )
                                    )}
                            </Flex>
                        </ScrollArea>
                    </Box>

                    <InfoView title="Current Inventory" cardProps={{ padding: 0 }}>
                        <ListView
                            data={
                                data.itemsByType?.itemByTypes.map((i) => ({
                                    id: i.typeId,
                                    ...i,
                                })) ?? []
                            }
                            withSearch={false}
                            showPagination={false}
                            withOffset={false}
                        >
                            {({ type, statusCount }) => (
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
                                                <Text c="green">
                                                    {statusCount["returned"]} available
                                                </Text>
                                                <Text c="red">
                                                    {statusCount["out"] +
                                                        statusCount["lost"] +
                                                        statusCount["unknown"]}{" "}
                                                    outstanding
                                                </Text>
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
