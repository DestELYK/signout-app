import {
    Button,
    Checkbox,
    Collapse,
    Flex,
    Group,
    Paper,
    Skeleton,
    Stack,
    Table,
    Text,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import {
    typedjson,
    useTypedFetcher,
    useTypedLoaderData,
    useTypedRouteLoaderData,
} from "remix-typedjson";
import invariant from "tiny-invariant";
import PersonPicker from "~/components/people/PersonPicker";
import TagGroup from "~/components/tags/TagGroup";
import { prisma } from "~/lib/prisma.server";
import { OUT_COLOR } from "~/utils/consts";
import { PatchLoanFormData } from "~/utils/types.server";
import { dateDiff } from "~/utils/utils";
import { action, loader as loanLoader } from "./loans_.$loanId";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.loanId, "Expected params.loanId");

    const loanId = parseInt(params.loanId);

    return typedjson({
        items: await prisma.loanedItem.findMany({
            where: { loanId: loanId },
            select: {
                item: {
                    select: {
                        name: true,
                        tags: true,
                    },
                },
                itemId: true,
                dateLoaned: true,
                dateReturned: true,
            },
            orderBy: {
                dateReturned: {
                    sort: "asc",
                    nulls: "last",
                },
            },
        }),
    });
};

export default function Page() {
    const loanData = useTypedRouteLoaderData<typeof loanLoader>("routes/loans_.$loanId");
    const params = useParams();
    const data = useTypedLoaderData<typeof loader>();
    const [returnedByPerson, setReturnedByPerson] = useState(loanData?.loan?.person);

    const submit = useTypedFetcher<typeof action>();

    const { loanId } = params;

    const form = useForm<
        Required<Pick<PatchLoanFormData, "itemIds">> & Pick<PatchLoanFormData, "dateReturned">
    >({
        initialValues: {
            itemIds: [],
        },
        validate: {
            itemIds: (value) => {
                if (value.length === 0) {
                    return "At least 1 item needs to be selected";
                }
            },
        },
    });

    const rows = data.items.map((item) => {
        const selected = form.values.itemIds.find((i) => i.id === item.itemId) !== undefined;

        const outstanding = !item.dateReturned;

        return (
            <Table.Tr
                key={item.itemId}
                bg={selected ? "var(--mantine-color-blue-light)" : undefined}
            >
                <Table.Td>
                    <Checkbox
                        aria-label="Select row"
                        checked={selected}
                        disabled={!outstanding}
                        onChange={(event) => {
                            if (event.currentTarget.checked) {
                                form.setFieldValue("itemIds", [
                                    ...form.values.itemIds,
                                    { id: item.itemId },
                                ]);
                            } else {
                                form.setFieldValue(
                                    "itemIds",
                                    form.values.itemIds.filter((i) => i.id !== item.itemId)
                                );
                            }
                        }}
                    />
                </Table.Td>
                <Table.Td>
                    <Stack gap={0}>
                        <Text c={!outstanding ? "dimmed" : undefined}>{item.item.name}</Text>
                        <TagGroup
                            tags={item.item.tags}
                            categories={["Item Type"]}
                            groupProps={{ justify: "start" }}
                            badgeProps={{ size: "xs" }}
                        />
                    </Stack>
                </Table.Td>
                <Table.Td color="">
                    <Stack gap={0}>
                        <Text c={outstanding ? OUT_COLOR : "dimmed"}>
                            {outstanding ? "Outstanding" : "Returned"}
                        </Text>
                        <Text c="dimmed" size="xs">
                            {"("}
                            {dateDiff({ date: item.dateReturned ?? item.dateLoaned })}
                            {")"}
                        </Text>
                    </Stack>
                </Table.Td>
            </Table.Tr>
        );
    });

    useEffect(() => {
        if (submit.data) {
            notifications.show({
                message: `Successfully signed-in ${form.values.itemIds.length} item${
                    form.values.itemIds.length > 1 ? "s" : ""
                }`,
            });

            form.reset();
        }
    }, [submit.data]);

    useEffect(() => {
        setReturnedByPerson(loanData?.loan?.person);
    }, [loanData]);

    return (
        <Flex direction="column" w="100%" h="100%" gap="md" p="sm">
            {data ? (
                <>
                    <Table w="100%" withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th w={120}>
                                    <Checkbox
                                        label="Select All"
                                        onChange={(event) => {
                                            if (event.currentTarget.checked) {
                                                form.setFieldValue(
                                                    "itemIds",
                                                    data.items.map((i) => ({ id: i.itemId }))
                                                );
                                            } else {
                                                form.setFieldValue("itemIds", []);
                                            }
                                        }}
                                        disabled={
                                            data.items.filter((i) => !i.dateReturned).length === 0
                                        }
                                        checked={
                                            form.values.itemIds.length ===
                                            data.items.filter((i) => !i.dateReturned).length
                                        }
                                        indeterminate={
                                            form.values.itemIds.length > 0 &&
                                            form.values.itemIds.length <
                                                data.items.filter((i) => !i.dateReturned).length
                                        }
                                    />
                                </Table.Th>
                                <Table.Th>Item</Table.Th>
                                <Table.Th>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                        {data.items.filter((i) => !i.dateReturned).length == 0 && (
                            <Table.Caption>All items have been returned</Table.Caption>
                        )}
                    </Table>
                    <Collapse in={form.isValid()}>
                        <Stack gap="sm">
                            <DateTimePicker
                                valueFormat="DD MMM, YYYY @ hh:mm A"
                                label="Date Returned"
                                description="Select the date that the item(s) were returned, will default to current time if left blank"
                                {...form.getInputProps("dateReturned")}
                                value={
                                    form.values.dateReturned
                                        ? new Date(form.values.dateReturned)
                                        : new Date()
                                }
                            />
                            <Stack gap={0}>
                                <Text inline size="sm" fw={500} mb={8}>
                                    Returned By
                                </Text>
                                <Text inline size="xs" c="dimmed" mb={5}>
                                    Select who returned the item, defaults to the person who
                                    signed-out the item(s) originally
                                </Text>
                                <PersonPicker
                                    value={returnedByPerson}
                                    onChanged={(person) => {
                                        setReturnedByPerson(person);
                                        form.setFieldValue(
                                            "itemIds",
                                            form.values.itemIds.map((i) => ({
                                                ...i,
                                                returnedById: person?.id,
                                            }))
                                        );
                                    }}
                                    withBorder={true}
                                    p="xs"
                                />
                            </Stack>
                            <Group justify="end"></Group>
                        </Stack>
                    </Collapse>
                    {data.items.filter((i) => !i.dateReturned).length > 0 && (
                        <Button
                            type="submit"
                            loading={submit.state === "submitting"}
                            leftSection={
                                form.values.itemIds.length > 0 ? (
                                    <Paper
                                        w="25px"
                                        h="25px"
                                        radius="25px"
                                        bg="var(--mantine-primary-color-light-color)"
                                        style={{ textAlign: "center", alignContent: "center" }}
                                    >
                                        {form.values.itemIds.length}
                                    </Paper>
                                ) : undefined
                            }
                            onClick={() => {
                                form.values.itemIds.length === 0
                                    ? form.setFieldValue(
                                          "itemIds",
                                          data.items.map((i) => ({ id: i.itemId }))
                                      )
                                    : form.isValid() &&
                                      submit.submit(form.values, {
                                          action: `/loans/${loanId}`,
                                          method: "PATCH",
                                          encType: "application/json",
                                      });
                            }}
                        >
                            {form.values.itemIds.length > 0
                                ? "Sign-In Item" + (form.values.itemIds.length > 1 ? "s" : "")
                                : "Select All"}
                        </Button>
                    )}
                </>
            ) : (
                <Skeleton h={200} />
            )}
        </Flex>
    );
}
