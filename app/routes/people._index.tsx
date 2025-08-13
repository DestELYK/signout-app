import { BarChart } from "@mantine/charts";
import { Box, Card, Center, Flex, Group, Skeleton } from "@mantine/core";
import { useNavigate, useNavigation } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import InfoView from "~/components/base/InfoView";
import PeopleList from "~/components/people/PeopleList";
import StatView from "~/components/StatView";
import { useDesktopOnly } from "~/lib/hooks";
import {
    getPeople,
    getPeopleWithInvalidItems,
    getPersonRoleCount as getRoleCount,
} from "~/lib/people.server";
import { prisma } from "~/lib/prisma.server";
import { formatFullName } from "~/utils/utils";

export const loader = async () => {
    const roleCount = await getRoleCount();

    const invalidItemsResult = await getPeopleWithInvalidItems();
    const outstandingLoansResult = await getPeople({ outstanding: true });

    return typedjson({
        roleLoans: roleCount.data ?? [],
        peopleWithLostItemsCount: invalidItemsResult.data?.length ?? 0,
        peopleWithOutstandingLoans:
            outstandingLoansResult.data?.sort((a, b) => {
                if (a.lostItemsCount && !b.lostItemsCount) {
                    return -1;
                } else if (!a.lostItemsCount && b.lostItemsCount) {
                    return 1;
                } else if (a.lostItemsCount && b.lostItemsCount) {
                    return a.lostItemsCount - b.lostItemsCount;
                } else {
                    return formatFullName(a).localeCompare(formatFullName(b));
                }
            }) ?? [],
        totalPeople: await prisma.person.count(),
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
                    align="stretch"
                    justify="stretch"
                >
                    <Flex direction="column" pos="relative" w={{ md: "60%", lg: "65%" }} gap="sm">
                        <Group align="stretch" grow style={{ flexWrap: "nowrap" }}>
                            <Card withBorder>
                                <StatView label="People" value={data.totalPeople} />
                            </Card>
                            <Card w={150} withBorder>
                                <StatView
                                    label="People with Outstanding Loans"
                                    value={data.peopleWithOutstandingLoans.length}
                                    color="red"
                                />
                            </Card>
                            <Card w={150} withBorder>
                                <StatView
                                    label="People with Lost Items"
                                    value={data.peopleWithLostItemsCount}
                                    color="red"
                                />
                            </Card>
                        </Group>
                        <InfoView title="Loans by Role">
                            {data.roleLoans && data.roleLoans.length > 0 ? (
                                <BarChart
                                    w="100%"
                                    h="100%"
                                    p="sm"
                                    orientation="vertical"
                                    data={data.roleLoans.map(({ role, loanCount, returnCount }) => {
                                        return {
                                            role: role,
                                            loaned: loanCount,
                                            returned: returnCount,
                                        };
                                    })}
                                    dataKey="role"
                                    barChartProps={{
                                        barCategoryGap: 3,
                                        barGap: 1,
                                    }}
                                    barProps={{
                                        onClick: (data) => {
                                            if ("role" in data) {
                                                navigate(`/people/list?role=${data.role}`);
                                            }
                                        },
                                        style: { cursor: "pointer" },
                                    }}
                                    gridAxis="y"
                                    xAxisProps={{ allowDecimals: false, tickCount: 10 }}
                                    yAxisProps={{ width: 80, interval: 0, axisLine: true }}
                                    series={[
                                        { name: "loaned", label: "Loans", color: "red" },
                                        { name: "returned", label: "Returns", color: "green" },
                                    ]}
                                />
                            ) : (
                                <Center h={200}>No data</Center>
                            )}
                        </InfoView>
                    </Flex>
                    <InfoView
                        title={`People with Outstanding Loans`}
                        cardProps={{
                            w: { md: "40%", lg: "35%" },
                            padding: 0,
                        }}
                    >
                        <PeopleList
                            data={data.peopleWithOutstandingLoans}
                            totalCount={data.peopleWithOutstandingLoans.length}
                            initialItemsPerPage={20}
                            emptyText="No people found"
                            showPagination={false}
                            withSearch={false}
                            withOffset={false}
                            withinParent
                            w="100%"
                            h="100%"
                        />
                    </InfoView>
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
                    <Group w="100%" h={120} align="stretch" grow style={{ flexWrap: "nowrap" }}>
                        <Card withBorder>
                            <StatView label="People" value={data.totalPeople} />
                        </Card>
                        <Card w={150} withBorder>
                            <StatView
                                label="People with Outstanding Loans"
                                value={data.peopleWithOutstandingLoans.length}
                                color="red"
                            />
                        </Card>
                        <Card w={150} withBorder>
                            <StatView
                                label="People with Lost Items"
                                value={data.peopleWithLostItemsCount}
                                color="red"
                            />
                        </Card>
                    </Group>

                    <InfoView title={`People with Outstanding Loans`}>
                        <PeopleList
                            data={data.peopleWithOutstandingLoans}
                            totalCount={data.peopleWithOutstandingLoans.length}
                            initialItemsPerPage={20}
                            emptyText="No people found"
                            showPagination={false}
                            withSearch={false}
                            withOffset={false}
                        />
                    </InfoView>
                </Flex>
                //#endregion
            )}
        </>
    );
}
