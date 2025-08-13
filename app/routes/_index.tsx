import { AreaChart, Sparkline } from "@mantine/charts";
import {
    Box,
    Card,
    Center,
    Flex,
    Group,
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
import StatView from "~/components/StatView";
import { useDesktopOnly } from "~/lib/hooks";
import { getItemsGroupedByType } from "~/lib/items.server";
import { getLoans, getTotalOutstandingLoans, groupLoansByYear } from "~/lib/loans.server";
import { getPeopleWithInvalidItems } from "~/lib/people.server";
import { MAX_RECENT_ITEMS } from "~/utils/consts";

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
    const recentLoans = await getLoans({ statuses: ["out"] }, undefined, MAX_RECENT_ITEMS);
    const peopleWithLostItems = await getPeopleWithInvalidItems();
    const inventory = await getItemsGroupedByType();
    const totalOutstanding = await getTotalOutstandingLoans();

    const loansByYear = await groupLoansByYear();

    if (
        recentLoans.error ||
        peopleWithLostItems.error ||
        inventory.error ||
        totalOutstanding.error ||
        loansByYear.error
    ) {
        throw new Error(
            recentLoans.error ||
                peopleWithLostItems.error ||
                inventory.error ||
                totalOutstanding.error ||
                loansByYear.error ||
                "An error occurred"
        );
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

export default function Index() {
    const navigate = useNavigate();
    const data = useTypedLoaderData<typeof loader>();

    const desktopOnly = useDesktopOnly();

    let totalAvailableItems = 0;
    data.inventory?.itemByTypes.forEach((i) => {
        totalAvailableItems += i.statusCount["returned"];
    });

    const today = dayjs();

    const dataToday = data.loansByYear?.find((l) => today.format("YYYY-MM-DD") === l.date) ?? {
        date: today.format("YYYY-MM-DD"),
        totalLoans: 0,
        totalReturns: 0,
    };

    return (
        <Flex
            w="100%"
            h={desktopOnly ? "100%" : undefined}
            mih={600}
            direction="column"
            wrap="nowrap"
            gap="sm"
            p="md"
            pos="relative"
        >
            <Text ta="center">
                Welcome to the SJK Signout App!
                <br />
                <br /> This is a web app for tracking inventory for item sign-outs. You can use the
                sidebar to navigate to different pages.
            </Text>
            {desktopOnly === undefined || data === undefined ? (
                <Box w="100%" h="100%" pos="relative">
                    <Skeleton w="100%" h="100%" />
                </Box>
            ) : desktopOnly ? (
                <>
                    <Group w="100%" h="75%" grow>
                        <Card h="100%" withBorder>
                            <Card.Section inheritPadding withBorder>
                                <StatView
                                    h={100}
                                    label="Outstanding Loans"
                                    caption="Loans that are currently outstanding"
                                    value={data.totalOutstanding ?? 0}
                                />
                            </Card.Section>
                            <Card.Section h="calc(100% - 70px)">
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
                            </Card.Section>
                        </Card>
                        <Card h="100%" withBorder>
                            <Card.Section inheritPadding withBorder>
                                <StatView
                                    h={100}
                                    label="People with Lost Items"
                                    caption="People who have lost loaned out items"
                                    value={data.peopleWithLostItemsTotalCount ?? 0}
                                />
                            </Card.Section>
                            <Card.Section h="calc(100% - 70px)">
                                <PeopleList
                                    data={data.peopleWithLostItems}
                                    initialItemsPerPage={MAX_RECENT_ITEMS}
                                    totalCount={data.peopleWithLostItemsTotalCount}
                                    withSearch={false}
                                    w="100%"
                                    h="100%"
                                    withinParent
                                />
                            </Card.Section>
                        </Card>
                        <Card h="100%" withBorder>
                            <Card.Section inheritPadding withBorder>
                                <StatView
                                    h={100}
                                    label="Available Items"
                                    caption="Number of Available Items"
                                    value={totalAvailableItems}
                                />
                            </Card.Section>
                            <Card.Section h="calc(100% - 70px)">
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
                            </Card.Section>
                        </Card>
                    </Group>
                    <Flex direction="row" wrap="nowrap" w="100%" h={180} gap="sm">
                        <InfoView
                            title="Loans in the Past Year"
                            cardProps={{ w: "100%", h: "100%" }}
                            rightSection={
                                <Text c="gray" ta="right">
                                    {today.format("MMMM DD, YYYY")}
                                </Text>
                            }
                        >
                            {data.loansByYear?.length === 0 ? (
                                <Center h="100%">
                                    <Text ta="center">No loans in the past year</Text>
                                </Center>
                            ) : (
                                <Suspense fallback={<Skeleton w="100%" h="100%" />}>
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
                        <Stack h="100%">
                            <Card withBorder>
                                <StatView label="Loans Today" value={dataToday.totalLoans} />
                            </Card>
                            <Card withBorder>
                                <StatView label="Returns Today" value={dataToday.totalReturns} />
                            </Card>
                        </Stack>
                    </Flex>
                </>
            ) : (
                <>
                    <Card withBorder>
                        <Card.Section inheritPadding withBorder p="sm">
                            <StatView
                                label="Outstanding Loans"
                                caption="Loans that are currently outstanding"
                                value={data.totalOutstanding ?? 0}
                                onClick={() => {
                                    navigate("/loans/list?status=outstanding");
                                }}
                            />
                        </Card.Section>
                        <Card.Section inheritPadding withBorder p="sm">
                            <StatView
                                label="People with Lost Items"
                                caption="People who have lost loaned out items"
                                value={data.peopleWithLostItemsTotalCount ?? 0}
                                onClick={() => {
                                    navigate("/people");
                                }}
                            />
                        </Card.Section>
                        <Card.Section inheritPadding withBorder p="sm">
                            <StatView
                                label="Items Available"
                                caption="Number of Available Items"
                                value={totalAvailableItems}
                                onClick={() => {
                                    navigate("/items/list?status=available");
                                }}
                            />
                        </Card.Section>
                    </Card>
                    <InfoView
                        title="Loans in the Past Year"
                        cardProps={{ w: "100%", mih: 130 }}
                        rightSection={
                            <Text c="gray" ta="right">
                                {today.format("MMMM DD, YYYY")}
                            </Text>
                        }
                    >
                        {data.loansByYear?.length === 0 ? (
                            <Center h="100%">
                                <Text ta="center">No loans in the past year</Text>
                            </Center>
                        ) : (
                            <Sparkline
                                w="100%"
                                h={50}
                                data={data.loansByYear?.map((l) => l.totalLoans) ?? []}
                                color="red"
                            />
                        )}
                    </InfoView>
                    <Group grow gap="xs">
                        <Card withBorder>
                            <StatView
                                label="Loans Today"
                                value={dataToday.totalLoans}
                                onClick={() => navigate("/loans")}
                            />
                        </Card>
                        <Card withBorder>
                            <StatView
                                label="Returns Today"
                                value={dataToday.totalReturns}
                                onClick={() => navigate("/loans")}
                            />
                        </Card>
                    </Group>
                </>
            )}
        </Flex>
    );
}
