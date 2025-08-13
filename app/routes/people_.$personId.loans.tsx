import { Accordion, Button, Card, Center, Group, Stack, Text } from "@mantine/core";
import { Link, useNavigation, useParams, useSearchParams } from "@remix-run/react";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import HoverBadge from "~/components/HoverBadge";
import LoanSimpleView from "~/components/loans/LoanSimpleView";
import { QRCodeWithComponent } from "~/components/qrCode/QRCodeWithComponent";
import StatusBadge from "~/components/StatusBadge";
import TagGroup from "~/components/tags/TagGroup";
import { LoanData } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import { loader } from "./people_.$personId";

export default function Page() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigation = useNavigation();
    const params = useParams();
    const personData = useTypedRouteLoaderData<typeof loader>("routes/people_.$personId");

    const personId = params.personId;
    const loanId = searchParams.get("id");

    const loanItem = (loan: LoanData) => (
        <>
            <Card w="100%" withBorder>
                {loan.items.map((item) => (
                    <Card.Section key={item.itemId} inheritPadding withBorder py="sm">
                        <QRCodeWithComponent key={item.itemId} qrCode={item.uuid}>
                            <Stack w="100%" gap={0}>
                                <Text component={Link} to={`/items/${item.itemId}`}>
                                    {item.name}
                                </Text>
                                {item.dateReturned && (
                                    <>
                                        {item.returnedBy &&
                                            item.returnedBy.id.toString() !== personId && (
                                                <Text size="xs">
                                                    Returned By:{" "}
                                                    <span
                                                        style={{
                                                            fontWeight: "bold",
                                                            color: "red",
                                                        }}
                                                    >
                                                        {formatFullName(item.returnedBy)}
                                                    </span>
                                                </Text>
                                            )}
                                        <Text size="xs">
                                            Date Returned:{" "}
                                            {formatDate(item.dateReturned, {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                            <br />
                                            <span style={{ fontWeight: "bold" }}>
                                                ({dateDiff({ date: item.dateReturned })})
                                            </span>
                                        </Text>
                                    </>
                                )}
                                <Group justify="end" mt="sm">
                                    {item.type && (
                                        <HoverBadge
                                            name={item.type.name}
                                            description={item.type.description}
                                        />
                                    )}
                                    {item.status && <StatusBadge status={item.status} />}
                                </Group>
                            </Stack>
                        </QRCodeWithComponent>
                    </Card.Section>
                ))}
            </Card>
            <Group justify="end" mt="sm">
                <TagGroup tags={loan.tags} />
                <Button
                    variant="outline"
                    rightSection={<IconArrowRight />}
                    component={Link}
                    to={`/loans/${loanId}`}
                >
                    View
                </Button>
                {loan.dateReturned === null && (
                    <Button
                        variant="outline"
                        rightSection={<IconCheck />}
                        component={Link}
                        to={`/loans/${loanId}/signin`}
                    >
                        Sign-In
                    </Button>
                )}
            </Group>
        </>
    );

    return (
        <>
            {personData &&
                (personData.error ? (
                    <Text ta="center" c="red">
                        {personData.error}
                    </Text>
                ) : personData.data && personData.data.loans && personData.data.loans.length > 0 ? (
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
                            value={loanId || null}
                        >
                            {personData.data.loans.map((loan) => (
                                <Accordion.Item key={loan.id} value={loan.id.toString()}>
                                    <Accordion.Control>
                                        <LoanSimpleView
                                            id={loan.id}
                                            dateLoaned={loan.dateLoaned}
                                            itemCount={loan.itemsCount}
                                            status={loan.status}
                                        />
                                    </Accordion.Control>
                                    <Accordion.Panel>{loanItem(loan)}</Accordion.Panel>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </>
                ) : (
                    <Center h="100%">
                        <Stack>
                            <Text ta="center">No loans have been created</Text>
                            <Button component={Link} to="/loans?create=">
                                Create a new loan here
                            </Button>
                        </Stack>
                    </Center>
                ))}
        </>
    );
}
