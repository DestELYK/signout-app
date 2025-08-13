import { Box, Card, Divider, Flex, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useDesktopOnly } from "~/lib/hooks";
import { PersonData } from "~/utils/types.server";
import { dateDiff, formatDate, formatDuration } from "~/utils/utils";
import EditableNotes from "../EditableNotes";
import StatView from "../StatView";
import LastLoanView from "../loans/LastLoanView";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";

export interface PersonDetailsViewProps {
    data?: PersonData;
}

export default function PersonDetailsView({ data }: PersonDetailsViewProps) {
    const desktopOnly = useDesktopOnly();
    const navigate = useNavigate();

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
                    <Box px="md">
                        <QRCodeWithComponent qrCode={data.schoolId} scale={4} alt="No Student ID">
                            <StatView
                                label="Student ID"
                                value={data.schoolId || "N/A"}
                                {...(data.schoolId && {
                                    onClick: () => navigate(`/people/profile/${data.schoolId}`),
                                })}
                            />
                        </QRCodeWithComponent>
                    </Box>
                    <Divider w="100%" />

                    <StatView value={data.loansCount ?? 0} label="Total Loans" />

                    <Divider w="100%" />
                    {/* Outstanding Items */}
                    <Group align="stretch" grow>
                        <StatView
                            color={
                                data.outstandingItemsCount && data.outstandingItemsCount > 0
                                    ? "red"
                                    : undefined
                            }
                            value={data.outstandingItemsCount ?? 0}
                            label="Outstanding Items"
                        />

                        <StatView
                            color={
                                data.lostItemsCount && data.lostItemsCount > 0 ? "red" : undefined
                            }
                            value={data.lostItemsCount ?? 0}
                            label="Lost Items"
                        />

                        <StatView
                            color={
                                data.totalItemsNotReturnedCount &&
                                data.totalItemsNotReturnedCount > 0
                                    ? "red"
                                    : undefined
                            }
                            value={data.totalItemsNotReturnedCount ?? 0}
                            label="Not Returned Items"
                        />

                        <StatView
                            color={
                                (data.totalReturnedItemsCount ?? 0) < (data.totalItemsCount ?? 0)
                                    ? "red"
                                    : (data.totalReturnedItemsCount ?? 0) >
                                      (data.totalItemsCount ?? 0)
                                    ? "green"
                                    : undefined
                            }
                            value={data.totalReturnedItemsCount ?? 0}
                            label="Returned Items"
                        />

                        <StatView value={data.totalItemsCount ?? 0} label="Total Items Loaned" />
                    </Group>
                    <Divider w="100%" />

                    {/* Average Return Time */}
                    <Flex direction="row" justify="center" align="center" wrap="nowrap">
                        <StatView
                            value={
                                data.averageReturnTime
                                    ? formatDuration(data.averageReturnTime)
                                    : "N/A"
                            }
                            label="Average Return Time"
                        />
                    </Flex>

                    <Divider w="100%" />

                    {/* Created Date */}
                    <Flex direction="row" justify="center" align="center" wrap="nowrap">
                        {data.createdDate !== undefined && (
                            <StatView
                                value={dateDiff({ date: data.createdDate, withoutSuffix: true })}
                                label="Since Creation"
                                caption={formatDate(data.createdDate)}
                            />
                        )}

                        {/* Updated Date */}
                        {data.updatedDate !== undefined && (
                            <StatView
                                value={dateDiff({ date: data.updatedDate, withoutSuffix: true })}
                                label="Since Updated"
                                caption={formatDate(data.updatedDate)}
                            />
                        )}
                    </Flex>
                    <Divider w="100%" />
                </Stack>
            ) : (
                <Stack w="100%" h="100%" p="sm">
                    {/* Item Card */}
                    <Title order={4}>Details</Title>
                    <Card withBorder>
                        <QRCodeWithComponent qrCode={data.schoolId} scale={2.5} alt="No School ID">
                            <Flex w="100%" direction="column">
                                <Text size="xs">
                                    {data.loansCount ?? 0} Total Loans{" "}
                                    {data.outstandingItemsCount ? (
                                        <>
                                            <Text span inherit c="red" fw="bold">
                                                ({data.outstandingItemsCount} Outstanding)
                                            </Text>
                                        </>
                                    ) : undefined}
                                </Text>
                                <Text size="xs">
                                    {data.totalItemsCount ?? 0} Total Items{" "}
                                    {data.totalReturnedItemsCount ? (
                                        <>
                                            <Text
                                                span
                                                inherit
                                                c={
                                                    (data.totalReturnedItemsCount ?? 0) <
                                                    (data.totalItemsCount ?? 0)
                                                        ? "red"
                                                        : (data.totalReturnedItemsCount ?? 0) >
                                                          (data.totalItemsCount ?? 0)
                                                        ? "green"
                                                        : undefined
                                                }
                                                fw="bold"
                                            >
                                                ({data.totalReturnedItemsCount} Returned)
                                            </Text>
                                        </>
                                    ) : undefined}
                                </Text>
                                {data.lostItemsCount !== undefined && data.lostItemsCount > 0 && (
                                    <Text mt="sm" fw="bold" size="xs" c="red">
                                        {data.lostItemsCount} Lost Item
                                        {data.lostItemsCount > 1 ? "s" : ""}
                                    </Text>
                                )}
                                {data.lostItems?.slice(0, 2).map((i) => (
                                    <Group key={i.id}>
                                        <Text size="xs" c="dimmed">
                                            {i.name}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {i.status && i.status.id === "returned"
                                                ? `(${i.status.name})`
                                                : i.status
                                                ? ` (${i.status.name})`
                                                : "Unknown Status"}
                                        </Text>
                                    </Group>
                                ))}
                                {data.lostItems !== undefined && data.lostItems.length > 2 && (
                                    <Text fs="italic" size="xs">
                                        ...and {data.lostItems.length - 2} other items
                                    </Text>
                                )}
                                {data.totalReturnedItemsCount !== data.totalItemsCount && (
                                    <Text mt="sm" size="xs" c="red">
                                        Person did not return all of their items
                                    </Text>
                                )}
                            </Flex>
                        </QRCodeWithComponent>
                    </Card>
                    {/* Notes */}
                    <Title order={4}>Notes</Title>
                    <EditableNotes value={data.notes} action={`/people/${data.id}`} editable />

                    {/* Last Loan Card */}
                    {data.lastLoan !== undefined && (
                        <>
                            <Title order={4}>Last Loan</Title>
                            <LastLoanView data={data.lastLoan} showItems={false} prefix="Loan" />
                        </>
                    )}

                    {/* Average Return Time */}
                    <Group w="100%" align="stretch" grow>
                        {data.lostItemsCount !== undefined && data.lostItemsCount > 0 && (
                            <Card withBorder>
                                <StatView
                                    color="red"
                                    value={data.lostItemsCount}
                                    label="Lost Items"
                                />
                            </Card>
                        )}
                        {data.averageReturnTime !== undefined &&
                            Math.round(data.averageReturnTime) > 0 && (
                                <Card withBorder>
                                    <StatView
                                        value={formatDuration(data.averageReturnTime)}
                                        label="Average Return Time"
                                    />
                                </Card>
                            )}
                    </Group>

                    {/* Created Date */}
                    <Group w="100%" align="stretch" grow>
                        {data.createdDate !== undefined && (
                            <Card withBorder>
                                <StatView
                                    value={dateDiff({
                                        date: data.createdDate,
                                        withoutSuffix: true,
                                    })}
                                    label="Since Creation"
                                    caption={formatDate(data.createdDate)}
                                />
                            </Card>
                        )}

                        {/* Updated Date */}
                        {data.updatedDate !== undefined && (
                            <Card withBorder>
                                <StatView
                                    value={dateDiff({
                                        date: data.updatedDate,
                                        withoutSuffix: true,
                                    })}
                                    label="Since Updated"
                                    caption={formatDate(data.updatedDate)}
                                />
                            </Card>
                        )}
                    </Group>
                </Stack>
            )}
        </>
    );
}
