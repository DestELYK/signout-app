import {
    Box,
    Card,
    Divider,
    Flex,
    Group,
    Skeleton,
    Stack,
    Text,
    Textarea,
    Title,
} from "@mantine/core";
import { useDesktopOnly } from "~/lib/hooks";
import { ItemData } from "~/utils/types.server";
import { dateDiff, formatDate, formatDuration } from "~/utils/utils";
import StatView from "../StatView";
import LastLoanView from "../loans/LastLoanView";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";

export interface ItemDetailsViewProps {
    data?: ItemData;
}

export default function ItemDetailsView({ data }: ItemDetailsViewProps) {
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
                    <Text px="md" fs="italic" c={data.description ? undefined : "dimmed"}>
                        {data.description || "No item description"}
                    </Text>
                    <Divider w="100%" />
                    <Box px="md">
                        <QRCodeWithComponent qrCode={data.uuid} scale={4}>
                            <StatView label="UUID" value={data.uuid || "N/A"} size="20px" />
                        </QRCodeWithComponent>
                    </Box>
                    <Divider w="100%" />
                    {/* Outstanding Items */}
                    <Flex direction="row" justify="center" align="center" wrap="nowrap">
                        <StatView value={data.totalLoansCount ?? 0} label="Total Signouts" />
                        <StatView value={data.uniquePeopleCount ?? 0} label="Unique People" />
                    </Flex>
                    <Divider w="100%" />
                    {data.averageLoanTime !== undefined && (
                        <>
                            <StatView
                                value={formatDuration(data.averageLoanTime)}
                                label="Average Return Duration"
                            />
                            <Divider w="100%" />
                        </>
                    )}

                    <Flex direction="row" justify="center" align="center" wrap="nowrap">
                        {/* Created Date */}
                        {data.createdDate !== undefined && (
                            <StatView
                                value={dateDiff({ date: data.createdDate, withoutSuffix: true })}
                                label="Since Creation"
                                caption={formatDate(data.createdDate)}
                                w="100%"
                            />
                        )}
                        {/* Updated Date */}
                        {data.updatedDate !== undefined && (
                            <StatView
                                value={dateDiff({ date: data.updatedDate, withoutSuffix: true })}
                                label="Since Updated"
                                caption={formatDate(data.updatedDate)}
                                w="100%"
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
                        <QRCodeWithComponent qrCode={data.uuid} scale={2.5}>
                            <Stack gap={0}>
                                <Text fw="bold" mb="md" size="sm">
                                    Current Status:{" "}
                                    <Text span c={data.status?.color ?? "gray"}>
                                        {data.status?.name ?? "Unknown"}
                                    </Text>
                                </Text>
                                <Text fs="italic" c={data.description ? undefined : "dimmed"}>
                                    {data.description || "No item description"}
                                </Text>
                            </Stack>
                        </QRCodeWithComponent>
                    </Card>

                    {/* Last Loan Card */}
                    {data.lastLoan !== undefined && data.lastLoan.person && (
                        <>
                            <Title order={4}>Last Loan</Title>
                            <LastLoanView data={data.lastLoan} showItems={false} prefix="Loan" />
                        </>
                    )}
                    {/* Notes */}
                    <Title order={4}>Notes</Title>
                    <Textarea
                        w="100%"
                        minRows={5}
                        maxRows={5}
                        autosize
                        value={data.notes}
                        placeholder="No notes"
                        readOnly
                    />

                    {/* Outstanding Items */}
                    <Group w="100%" align="stretch" grow>
                        <Card withBorder>
                            <StatView value={data.totalLoansCount ?? 0} label="Total Signouts" />
                        </Card>
                        {data.averageLoanTime !== undefined && (
                            <Card withBorder>
                                <StatView
                                    value={formatDuration(data.averageLoanTime)}
                                    label="Average Return Duration"
                                />
                            </Card>
                        )}
                    </Group>

                    <Group w="100%" align="stretch" grow>
                        {/* Created Date */}
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
