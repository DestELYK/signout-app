import { Flex, Group, Stack, Text } from "@mantine/core";
import { Link } from "@remix-run/react";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";

import { LoanedItemData } from "~/utils/types.server";
import StatusBadge from "../StatusBadge";
import QRCodePreview from "../qrCode/QRCodePreview";
import TagGroup from "../tags/TagGroup";

export interface LoanedItemInfoViewProps {
    data: LoanedItemData;
    rightSection?: React.ReactNode;
    showDetails?: boolean;
    showOutstanding?: boolean;
    children?: React.ReactNode;
}

export default function LoanedItemInfoView({
    data,
    rightSection,
    showDetails = true,
    showOutstanding = true,
    children,
}: LoanedItemInfoViewProps) {
    return (
        <Stack gap={0} mb="sm" w="100%">
            <Flex
                w="100%"
                direction="row"
                wrap="nowrap"
                align="center"
                justify="space-between"
                mb="sm"
            >
                <Flex direction="row" wrap="nowrap" align="center" gap="xs">
                    {/* QR Code Image */}
                    <QRCodePreview qrCode={data.uuid} />
                    <Stack gap={0}>
                        {/* Item Name */}
                        <Text
                            fw="bold"
                            lineClamp={1}
                            component={Link}
                            to={`/items/${data.itemId}`}
                            style={{ cursor: "pointer" }}
                        >
                            {data.name}
                        </Text>
                        {/* Tags */}
                        <Group gap="xs">
                            {data.tags && data.tags.length > 0 && (
                                <TagGroup
                                    tags={data.tags}
                                    categories={["Item Type"]}
                                    badgeProps={{ size: "xs" }}
                                />
                            )}
                        </Group>
                    </Stack>
                </Flex>
                <Flex direction="row" align="center" wrap="nowrap" gap="xs">
                    {/* Outstanding Indicator */}
                    {showOutstanding && data.dateLoaned && (
                        <StatusBadge status={data.status} />
                    )}
                    {rightSection}
                </Flex>
            </Flex>
            {/* Description */}
            {showDetails && data.description && (
                <Text size="sm" lineClamp={1} mb="sm" fs="italic">
                    {data.description}
                </Text>
            )}
            {/* Date Returned */}
            {showDetails &&
                (data.dateReturned ? (
                    <Text size="xs" lineClamp={1}>
                        Returned: {formatDate(data.dateReturned)} (
                        {dateDiff({ date: data.dateReturned })})
                    </Text>
                ) : (
                    data.dateLoaned && (
                        <Text size="xs" lineClamp={1}>
                            Last Seen: {formatDate(data.dateLoaned)} (
                            {dateDiff({ date: data.dateLoaned })})
                        </Text>
                    )
                ))}
            {/* Returned By */}
            {data.returnedBy && (
                <Text size="xs" lineClamp={1}>
                    Returned by:{" "}
                    <Text span inherit fw="bold">
                        {formatFullName(data.returnedBy)}
                    </Text>
                </Text>
            )}
            {children}
        </Stack>
    );
}
