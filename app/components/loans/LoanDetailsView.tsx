import { Card, Divider, Flex, Group, Skeleton, Stack, Title } from "@mantine/core";
import { dateDiff, formatDate } from "~/utils/utils";

import { useDesktopOnly } from "~/lib/hooks";
import { LoanData } from "~/utils/types.server";
import EditableNotes from "../EditableNotes";
import StatView from "../StatView";
import PersonListView from "../people/PersonListView";

export interface LoanDetailsViewProps {
    data?: LoanData;
}

export default function LoanDetailsView({ data }: LoanDetailsViewProps) {
    const desktopOnly = useDesktopOnly();

    return (
        <>
            {desktopOnly === undefined || data === undefined ? (
                <Stack w="100%" h="100%" pos="relative" p="sm">
                    <Skeleton w={200} h={20} radius={15} />
                    <Skeleton w="100%" h={100} radius={6} />
                    <Skeleton w={200} h={20} radius={15} />
                    <Skeleton w="100%" h={100} radius={6} />
                    <Skeleton w={200} h={20} radius={15} />
                    <Skeleton w="100%" h={100} radius={6} />
                </Stack>
            ) : desktopOnly ? (
                <Stack w="100%" h="100%" py="sm">
                    {data.returnedItemsCount !== undefined && data.itemsCount !== undefined && (
                        <StatView
                            value={`${data.returnedItemsCount}/${data.itemsCount}`}
                            color={data.returnedItemsCount !== data.itemsCount ? "red" : undefined}
                            label={"Returned Items"}
                            caption={
                                data.returnedItemsCount === data.itemsCount
                                    ? "All items returned"
                                    : undefined
                            }
                        />
                    )}
                    <Divider w="100%" />
                    <Flex direction="row" w="100%" wrap="nowrap">
                        {data.dateCreated !== undefined && (
                            <StatView
                                value={dateDiff({ date: data.dateCreated, withoutSuffix: true })}
                                label="Since Creation"
                                caption={formatDate(data.dateCreated)}
                            />
                        )}
                        {data.dateUpdated !== undefined && (
                            <StatView
                                value={dateDiff({ date: data.dateUpdated, withoutSuffix: true })}
                                label="Since Updated"
                                caption={formatDate(data.dateUpdated)}
                            />
                        )}
                    </Flex>
                    <Divider w="100%" />
                </Stack>
            ) : (
                <Stack w="100%" h="100%" p="sm">
                    {/* Person Card */}
                    <Title order={4}>Person</Title>
                    <Card withBorder padding={0}>
                        <PersonListView
                            person={data.person}
                            returned={
                                !data.items.every(
                                    (item) =>
                                        item.dateReturned !== undefined &&
                                        item.returnedBy?.id === data.person.id
                                )
                            }
                        />
                    </Card>

                    {/* Notes Card */}
                    <Title order={4}>Notes</Title>
                    <EditableNotes action={`/loans/${data.id}`} value={data.notes} editable />

                    <Group w="100%" align="stretch" grow>
                        {/* Outstanding Items */}
                        <Card withBorder>
                            <StatView
                                value={data.outstandingItemsCount ?? 0}
                                label="Outstanding Items"
                            />
                        </Card>

                        {/* Total Items */}
                        <Card withBorder>
                            <StatView value={data.itemsCount ?? 0} label="Total Items" />
                        </Card>
                    </Group>

                    <Group w="100%" align="stretch" grow>
                        {/* Created Date */}
                        {data.dateCreated !== undefined && (
                            <Card withBorder>
                                <StatView
                                    value={dateDiff({
                                        date: data.dateCreated,
                                        withoutSuffix: true,
                                    })}
                                    label="Since Creation"
                                    caption={formatDate(data.dateCreated)}
                                />
                            </Card>
                        )}

                        {/* Updated Date */}
                        {data.dateUpdated !== undefined && (
                            <Card withBorder>
                                <StatView
                                    value={dateDiff({
                                        date: data.dateUpdated,
                                        withoutSuffix: true,
                                    })}
                                    label="Since Updated"
                                    caption={formatDate(data.dateUpdated)}
                                />
                            </Card>
                        )}
                    </Group>
                </Stack>
            )}
        </>
    );
}
