import { Accordion, Button, Flex, Group, Stack, Text } from "@mantine/core";
import { Link, useNavigation, useParams, useSearchParams } from "@remix-run/react";
import { IconArrowRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { QRCodeWithComponent } from "~/components/qrCode/QRCodeWithComponent";
import StatusBadge from "~/components/StatusBadge";
import TagGroup from "~/components/tags/TagGroup";
import { loader } from "~/routes/loans_.$loanId";
import { LoanedItemData } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";

export default function Page() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigation = useNavigation();
    const params = useParams();
    const loanData = useTypedRouteLoaderData<typeof loader>("routes/loans_.$loanId");

    const loanId = params.loanId;
    const itemId = searchParams.get("id");

    const loanedItem = (loanedItem: LoanedItemData) => (
        <Stack gap="xs">
            <QRCodeWithComponent qrCode={loanedItem.uuid} scale={2.5}>
                <Flex w="100%" direction="column" gap="xs">
                    {loanedItem.dateLoaned && (
                        <Text size="xs">
                            Date Loaned: {formatDate(loanedItem.dateLoaned)}
                            <br />
                            <span style={{ fontWeight: "bold" }}>
                                ({dateDiff({ date: loanedItem.dateLoaned })})
                            </span>
                        </Text>
                    )}
                    {loanedItem.dateReturned && (
                        <Text size="xs">
                            Date Returned: {formatDate(loanedItem.dateReturned)}
                            <br />
                            <span style={{ fontWeight: "bold" }}>
                                (Took{" "}
                                {dayjs(loanedItem.dateReturned).from(loanedItem.dateLoaned, true)}{" "}
                                to return)
                            </span>
                        </Text>
                    )}
                    {loanedItem.returnedBy && (
                        <Text size="xs">
                            Returned By:{" "}
                            <span
                                style={{
                                    fontWeight: "bold",
                                    color:
                                        loanData?.data?.person.id !== loanedItem.returnedBy.id
                                            ? "red"
                                            : undefined,
                                }}
                            >
                                {formatFullName(loanedItem.returnedBy)}
                            </span>
                        </Text>
                    )}
                </Flex>
            </QRCodeWithComponent>
            <TagGroup
                tags={loanedItem.tags}
                categories={["Item Type"]}
                blacklist
                groupProps={{ justify: "end" }}
            />
            <Group justify="end" mt="sm">
                <Button
                    variant="outline"
                    rightSection={<IconArrowRight />}
                    component={Link}
                    to={`/items/${itemId}`}
                >
                    View
                </Button>
            </Group>
        </Stack>
    );

    return (
        <>
            {loanData &&
                (loanData.error ? (
                    <Text ta="center" c="red">
                        {loanData.error}
                    </Text>
                ) : (
                    loanData.data && (
                        <>
                            <Accordion
                                onChange={(value) => {
                                    if (!value) {
                                        setSearchParams(
                                            (prev) => {
                                                prev.delete("id");
                                                return prev;
                                            },
                                            { replace: true }
                                        );
                                    } else {
                                        setSearchParams({ id: value }, { replace: true });
                                    }
                                }}
                                value={itemId || null}
                            >
                                {loanData.data.items.map((item) => (
                                    <Accordion.Item
                                        key={item.itemId}
                                        value={item.itemId.toString()}
                                    >
                                        <Accordion.Control
                                            icon={<StatusBadge status={item.status} />}
                                        >
                                            <Text>{item.name}</Text>
                                            <Text size="xs" fs="italic">
                                                {item.description || "No description"}
                                            </Text>
                                        </Accordion.Control>
                                        <Accordion.Panel>{loanedItem(item)}</Accordion.Panel>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </>
                    )
                ))}
        </>
    );
}
