import { Badge, Flex, Highlight, Space, Text, UnstyledButton } from "@mantine/core";
import { Link, useNavigate } from "@remix-run/react";
import { IconChevronRight } from "@tabler/icons-react";
import { ItemData } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";
import LocationBadge from "./LocationBadge";

/**
 * Props for the ItemListView component.
 */
export interface ItemListViewProps {
    data: ItemData;
    highlight?: string;
    displayQRCode?: boolean;
}

export default function ItemListView({ data, highlight, displayQRCode }: ItemListViewProps) {
    const navigate = useNavigate();

    const content = (
        <Flex direction="row" align="center" justify="space-between">
            <Flex w="100%" direction="column" mr="lg">
                <Flex w="100%" direction="row" align="center" justify="space-between" wrap="nowrap">
                    <Highlight
                        fw="bold"
                        size="md"
                        lineClamp={2}
                        highlight={highlight ? highlight.split(" ") : ""}
                    >
                        {data.name}
                    </Highlight>
                    <LocationBadge data={data.location} />
                </Flex>
                {data.status && (
                    <Badge color={data.status.color} autoContrast>
                        {data.status.name}
                    </Badge>
                )}
                <Space h="xs" />
                {data.description && (
                    <Text size="xs" fs="italic" lineClamp={1} mt="xs">
                        {data.description}
                    </Text>
                )}

                {data.createdDate && (
                    <Text size="xs">
                        Added:{" "}
                        {formatDate(data.createdDate, {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                        })}{" "}
                        <b>({dateDiff({ date: data.createdDate })})</b>
                    </Text>
                )}

                {data.lastLoan && (
                    <>
                        {data.lastLoan.person && (
                            <Text size="xs">
                                Last Loaned by{" "}
                                <Link
                                    to={`/people/${data.lastLoan.person.id}`}
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    {formatFullName(data.lastLoan.person)}
                                </Link>
                            </Text>
                        )}

                        {data.lastLoan.dateLoaned && (
                            <Text size="xs">
                                {data.lastLoan.dateAllReturned ? "Returned " : "Loaned "}
                                {formatDate(data.lastLoan.dateLoaned, {
                                    month: "short",
                                    day: "2-digit",
                                    year: "numeric",
                                })}
                                <b>
                                    (
                                    {dateDiff({
                                        date: data.lastLoan.dateLoaned,
                                        otherDate: data.lastLoan.dateAllReturned,
                                        withoutSuffix: data.lastLoan.dateAllReturned !== undefined,
                                    })}
                                    )
                                </b>
                            </Text>
                        )}
                    </>
                )}
            </Flex>
            <IconChevronRight />
        </Flex>
    );

    return (
        <UnstyledButton
            className="list-item"
            w="100%"
            h="100%"
            onClick={() => navigate(`/items/${data.id}`)}
            p="xs"
        >
            {displayQRCode ? (
                <QRCodeWithComponent qrCode={data.uuid} scale={2}>
                    {content}
                </QRCodeWithComponent>
            ) : (
                content
            )}
        </UnstyledButton>
    );
}
