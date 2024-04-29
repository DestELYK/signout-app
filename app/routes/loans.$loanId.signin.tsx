import {
  Badge,
  Button,
  Checkbox,
  Collapse,
  Fieldset,
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
import { Form, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import {
  typedjson,
  useTypedFetcher,
  useTypedLoaderData,
  useTypedRouteLoaderData,
} from "remix-typedjson";
import invariant from "tiny-invariant";
import PersonPicker from "~/components/people/PersonPicker";
import { filterTags, formatDate } from "~/utils/utils";
import {
  PatchLoanFormData,
  action,
  loader as loanLoader,
} from "./loans.$loanId";

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
  const loanData = useTypedRouteLoaderData<typeof loanLoader>(
    "routes/loans.$loanId"
  );
  const params = useParams();
  const data = useTypedLoaderData<typeof loader>();
  const [returnedByPerson, setReturnedByPerson] = useState(
    loanData?.loan?.person
  );

  const submit = useTypedFetcher<typeof action>();

  const { loanId } = params;

  const form = useForm<
    Required<Pick<PatchLoanFormData, "itemIds">> &
      Pick<PatchLoanFormData, "dateReturned">
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
    const selected =
      form.values.itemIds.find((i) => i.id === item.itemId) !== undefined;

    const outstanding = item.dateReturned !== null;

    return (
      <Table.Tr
        key={item.itemId}
        bg={selected ? "var(--mantine-color-blue-light)" : undefined}
      >
        <Table.Td>
          <Checkbox
            aria-label="Select row"
            checked={selected}
            disabled={outstanding}
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
            <Text {...(outstanding && { c: "dimmed" })}>{item.item.name}</Text>
            <Group>
              {filterTags(item.item.tags, "Item Type").map((t) => (
                <Badge
                  key={t.id}
                  color={outstanding ? "dimmed" : t.color}
                  {...(outstanding && { c: "dimmed" })}
                  size="xs"
                  autoContrast
                >
                  {t.name}
                </Badge>
              ))}
            </Group>
          </Stack>
        </Table.Td>
        <Table.Td color="">
          <Text {...(outstanding && { c: "dimmed" })}>
            {!outstanding ? "Outstanding" : "Returned"}
          </Text>
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

  return (
    <Flex direction="column" w="100%" h="100%" gap="md">
      {data ? (
        <>
          <Table w="100%" withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th />
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
            <Form
              onSubmit={form.onSubmit((values) => {
                submit.submit(JSON.stringify(values), {
                  action: `/loans/${loanId}`,
                  method: "PATCH",
                  encType: "application/json",
                  navigate: false,
                });
              })}
            >
              <Stack gap="sm">
                <DateTimePicker
                  valueFormat="DD MMM, YYYY @ hh:mm A"
                  label="Date Returned"
                  description="Optional date, will default to current time if left blank"
                  placeholder={formatDate(new Date())}
                  onClick={() => form.setFieldValue("dateReturned", new Date())}
                  {...form.getInputProps("dateReturned")}
                />
                <Fieldset legend="Returned By">
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
                  />
                </Fieldset>
                <Group justify="end">
                  <Button
                    type="submit"
                    loading={submit.state === "submitting"}
                    leftSection={
                      <Paper
                        w="25px"
                        h="25px"
                        radius="25px"
                        bg="var(--mantine-primary-color-light-color)"
                        style={{ textAlign: "center", alignContent: "center" }}
                      >
                        {form.values.itemIds.length}
                      </Paper>
                    }
                  >
                    Sign-In Item
                    {form.values.itemIds.length > 1 ? "s" : ""}
                  </Button>
                </Group>
              </Stack>
            </Form>
          </Collapse>
        </>
      ) : (
        <Skeleton h={200} />
      )}
    </Flex>
  );
}
