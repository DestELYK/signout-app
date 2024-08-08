import {
    Badge,
    Button,
    Card,
    Group,
    MantineStyleProps,
    Paper,
    Space,
    Stack,
    Text,
} from "@mantine/core";
import { Link, useNavigate } from "@remix-run/react";
import { IN_COLOR, OUT_COLOR } from "~/utils/consts";
import { LastLoanData } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import InfoView from "../base/InfoView";
import ListView from "../base/ListView";
import TagGroup from "../tags/TagGroup";

export interface LastLoanViewProps {
    w?: MantineStyleProps["w"];
    h?: MantineStyleProps["h"];
    data?: LastLoanData;
    showPerson?: boolean;
    showItems?: boolean;
}

export default function LastLoanView({
    w,
    h,
    data,
    showPerson = true,
    showItems = true,
}: LastLoanViewProps) {
    const navigate = useNavigate();

    const outstanding = data?.items?.some((item) => !item.dateReturned);

    return data === undefined ? (
        <Card withBorder>
            <Stack w="100%" h="100%" align="center" justify="center">
                <Text c="dimmed">No Previous Loan</Text>
                <Button
                    onClick={() => {
                        navigate("/loans?create=");
                    }}
                >
                    Create New Loan
                </Button>
            </Stack>
        </Card>
    ) : (
        <InfoView
            title={`Last Loan: #${data.id}`}
            href={`/loans/${data.id}`}
            rightSection={<TagGroup tags={data.tags} categories={["Loan Info"]} />}
            bottomSection={
                <TagGroup
                    tags={data.tags}
                    categories={["Location"]}
                    groupProps={{ justify: "end" }}
                />
            }
            cardProps={{ w, h }}
        >
            <Stack gap={0}>
                <Text>
                    <b>Current Status: </b>
                    <Text span c={outstanding ? OUT_COLOR : IN_COLOR}>
                        {outstanding ? "Outstanding" : "Returned"}
                    </Text>
                </Text>
                {showPerson && (
                    <Group justify="space-between">
                        <Text component={Link} to={`/people/${data.person.id}`}>
                            <b>Loaned by: </b>
                            {formatFullName(data.person)}
                        </Text>
                        <Badge color={data.person.role.color} autoContrast>
                            {data.person.role.name}
                        </Badge>
                    </Group>
                )}
                {!showItems && (
                    <>
                        <Text mt="sm">
                            <b>{dateDiff({ date: data.dateLoaned, withoutSuffix: true })}</b> since
                            loan was created
                        </Text>
                        <Text size="xs" c="dimmed" fs="italic">
                            {formatDate(data.dateLoaned)}
                        </Text>
                        {data.dateReturned && (
                            <>
                                <Text mt="sm">
                                    <b>
                                        {dateDiff({ date: data.dateReturned, withoutSuffix: true })}
                                    </b>{" "}
                                    since returned
                                </Text>
                                <Text size="xs" c="dimmed" fs="italic">
                                    {formatDate(data.dateReturned)}
                                </Text>
                            </>
                        )}
                    </>
                )}
                <Space h="sm" />
                {data.items &&
                    (showItems ? (
                        <Paper withBorder p="xs">
                            <ListView
                                data={data.items}
                                orientation="horizontal"
                                withSearch={false}
                                showPagination={false}
                            >
                                {(item) => (
                                    <Stack key={item.id} miw={300} gap={0}>
                                        <Text fw="bold" component={Link} to={`/items/${item.id}`}>
                                            {item.name}
                                        </Text>

                                        <Text>
                                            <b>
                                                {dateDiff({
                                                    date: item.dateReturned ?? data.dateLoaned,
                                                    withoutSuffix: true,
                                                })}
                                            </b>{" "}
                                            since {item.dateReturned ? "returned" : "loaned"}
                                        </Text>
                                        <Text size="xs" c="dimmed" fs="italic">
                                            {item.dateReturned
                                                ? formatDate(item.dateReturned)
                                                : formatDate(data.dateLoaned)}
                                        </Text>
                                        {item.returnedBy && (
                                            <Text size="xs">
                                                Returned by:{" "}
                                                <Text
                                                    span
                                                    inherit
                                                    fw="bold"
                                                    {...(item.returnedBy.id !== data.person.id && {
                                                        c: "error",
                                                    })}
                                                >
                                                    {formatFullName(item.returnedBy)}
                                                </Text>
                                            </Text>
                                        )}
                                    </Stack>
                                )}
                            </ListView>
                        </Paper>
                    ) : (
                        <Text c="dimmed">
                            {data.items.length} item{data.items.length > 1 ? "s" : ""} loaned out
                        </Text>
                    ))}
            </Stack>
        </InfoView>
    );
}
