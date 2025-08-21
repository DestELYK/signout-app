/**
 * Loan sign-in route for processing item returns and loan completion
 *
 * This route provides loan return functionality including:
 * - Item-by-item sign-in with individual status updates
 * - Bulk return operations for entire loans
 * - Item condition assessment and status updates
 * - Person verification and return date/time tracking
 * - Selective item returns for partial loan completion
 *
 * @requires DateTimePicker for return date selection
 * @requires PersonPicker for return verification
 * @requires Form validation with Zod schemas
 * @requires Item status management and updates
 * @inherits loan data from parent loans_.$loanId route
 *
 * @module routes/loans/$loanId/signin
 *
 * @author Kyle Dunn
 */

import {
  Button,
  Checkbox,
  Collapse,
  Flex,
  InputWrapper,
  LoadingOverlay,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useField, useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useNavigation, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { z } from "zod";
import HoverBadge from "~/components/HoverBadge";
import PersonPicker from "~/components/people/PersonPicker";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { LoanFormSchema, LoanFormType } from "~/lib/schemas";
import { STATUS_OPTIONS } from "~/utils/consts";
import { dateDiff, formatDate } from "~/utils/utils";
import { action as loansAction, loader as loansLoader } from "./loans_.$loanId";

export default function Page() {
  const navigation = useNavigation();
  const loanData = useTypedRouteLoaderData<typeof loansLoader>("routes/loans_.$loanId");
  const params = useParams();
  const [items, setItems] = useState(loanData?.data?.items ?? []);

  const [status, setStatus] = useState("returned");
  const [dateReturned, setDateReturned] = useState<Date | null | undefined>(new Date());
  const [returnedByPerson, setReturnedByPerson] = useState(loanData?.data?.person);

  const notificationId = "loan-signin";

  const loading = navigation.state !== "idle";

  const reset = () => {
    form.reset();

    setStatus("returned");
    setDateReturned(new Date());
    setReturnedByPerson(loanData?.data?.person);

    statusField.reset();
    dateReturnedField.reset();
    returnedByField.reset();
  };

  const fetcher = useFetcherWithErrorHandler<typeof loansAction>(
    (data) => {
      reset();

      notifications.update({
        id: notificationId,
        message: `Successfully signed-in ${form.values.items.length} item${
          form.values.items.length > 1 ? "s" : ""
        }`,
        loading: false,
        autoClose: 5000,
        withCloseButton: true,
      });
    },
    (error) => {
      notifications.update({
        id: notificationId,
        message: `Failed to sign-in items for loan ${loanId}`,
        color: "red",
        loading: false,
        autoClose: 5000,
        withCloseButton: true,
      });
    }
  );

  // const submit = useTypedFetcher<typeof action>();

  const loanId = z.coerce.number().int().min(0).parse(params.loanId);

  const form = useForm<Pick<LoanFormType, "items">>({
    initialValues: {
      items: [],
    },
    onValuesChange(values, previous) {
      setStatus("returned");
      setDateReturned(new Date());
      setReturnedByPerson(loanData?.data?.person);

      statusField.setValue(status);
      dateReturnedField.setValue(dateReturned);
      returnedByField.setValue(returnedByPerson?.id);
    },
    validate: zodResolver(LoanFormSchema.pick({ items: true })),
  });

  const statusField = useField({
    initialValue: status,
    validate: (value) => {
      const result = z.string().min(3).safeParse(value);

      if (STATUS_OPTIONS.filter((o) => o.id === value).length === 0) {
        return "Invalid status provided";
      }

      if (result.success) {
        return undefined;
      }

      return result.error.message;
    },
  });

  const dateReturnedField = useField({
    initialValue: dateReturned,
    validate: (value) => {
      const result = z.date().nullish().safeParse(value);

      if (result.success) {
        return undefined;
      }

      return result.error.message;
    },
  });

  const returnedByField = useField({
    initialValue: returnedByPerson?.id,
    validate: (value) => {
      const result = z.number().int().min(0).safeParse(value);

      if (result.success) {
        return undefined;
      }

      return result.error.message;
    },
  });

  const rows = items.map((item) => {
    const selected = form.values.items.find((i) => i.itemId === item.itemId) !== undefined;

    const outstanding = item.dateReturned === undefined;

    return (
      <Table.Tr key={item.itemId} bg={selected ? "var(--mantine-color-blue-light)" : undefined}>
        <Table.Td>
          <Checkbox
            disabled={items.every((i) => i.status?.id === "returned")}
            aria-label="Select row"
            checked={selected}
            onChange={(event) => {
              if (event.currentTarget.checked) {
                form.setFieldValue("items", [
                  ...form.values.items,
                  { loanId: loanId, itemId: item.itemId },
                ]);
              } else {
                form.setFieldValue(
                  "items",
                  form.values.items.filter((i) => i.itemId !== item.itemId)
                );
              }
            }}
          />
        </Table.Td>
        <Table.Td>
          <Stack gap={0}>
            <Text c={!outstanding ? "dimmed" : undefined}>{item.name}</Text>
            <HoverBadge
              name={item.type?.name ?? "Unknown"}
              description={item.type?.description}
              badgeProps={{ size: "xs" }}
            />
          </Stack>
        </Table.Td>
        <Table.Td color="">
          <Stack gap={0}>
            <Text c={item.status?.color ?? "gray"}>{item.status?.name ?? "Unknown"}</Text>
            {item.dateLoaned && (
              <Text c="dimmed" size="xs">
                {formatDate(item.dateReturned ?? item.dateLoaned)}{" "}
                <b>
                  {"("}
                  {dateDiff({ date: item.dateReturned ?? item.dateLoaned })}
                  {")"}
                </b>
              </Text>
            )}
          </Stack>
        </Table.Td>
      </Table.Tr>
    );
  });

  useEffect(() => {
    setItems(loanData?.data?.items ?? []);
  }, [loanData]);

  return (
    <Flex pos="relative" direction="column" w="100%" h="100%" gap="md" p="sm">
      <LoadingOverlay visible={loading} />
      {loanData ? (
        loanData.error ? (
          <Text c="red">{loanData.error}</Text>
        ) : (
          loanData.data && (
            <>
              <Table w="100%" withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={50}>
                      <Tooltip
                        disabled={items.every((i) => i.status?.id === "returned")}
                        withArrow
                        label="Select All"
                      >
                        <Checkbox
                          disabled={items.every((i) => i.status?.id === "returned")}
                          onChange={(event) => {
                            if (event.currentTarget.checked) {
                              form.setFieldValue(
                                "items",
                                items.map((i) => ({
                                  loanId: loanId,
                                  itemId: i.itemId,
                                }))
                              );
                            } else {
                              form.setFieldValue("items", []);
                            }
                          }}
                          checked={form.values.items.length === items.length}
                          indeterminate={
                            form.values.items.length > 0 && form.values.items.length < items.length
                          }
                        />
                      </Tooltip>
                    </Table.Th>
                    <Table.Th>Item</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
                {items.every((i) => i.status?.id === "returned") && (
                  <Table.Caption>All items have been returned</Table.Caption>
                )}
              </Table>
              <Collapse in={form.isValid()}>
                <Stack gap="sm">
                  <Select
                    label="Status"
                    description="Modifies selected item's status (optional defaults to returned)"
                    data={STATUS_OPTIONS.map((o) => ({
                      value: o.id,
                      label: o.name,
                    })).filter((o) => o.value !== "out")}
                    value={status}
                    error={statusField.error}
                    onChange={(value) => {
                      if (value) {
                        setStatus(value);
                        statusField.setValue(value);
                      }
                    }}
                  />
                  <DateTimePicker
                    valueFormat="DD MMM, YYYY @ hh:mm A"
                    label="Date Returned"
                    description="Select the date that the item(s) were returned, will default to current time if left blank"
                    value={dateReturned}
                    minDate={loanData.data.dateCreated}
                    maxDate={new Date()}
                    error={dateReturnedField.error}
                    onBlur={dateReturnedField.validate}
                    onFocus={() => dateReturnedField.setError(null)}
                    onChange={(value) => {
                      setDateReturned(value);
                      dateReturnedField.setValue(value);
                    }}
                  />
                  <InputWrapper
                    label="Returned By"
                    description="Select who returned the item, defaults to the person who
                                            signed-out the item(s) originally"
                    error={returnedByField.error}
                  >
                    <Paper withBorder p="xs" mt={6}>
                      <PersonPicker
                        value={returnedByPerson}
                        onChange={(person) => {
                          setReturnedByPerson(person);
                          returnedByField.setValue(person?.id);
                        }}
                      />
                    </Paper>
                  </InputWrapper>
                </Stack>
              </Collapse>
              {items.length > 0 &&
                items.filter((i) => i.status?.id === "returned").length !== items.length && (
                  <Button
                    loading={loading}
                    leftSection={
                      form.values.items.length > 0 ? (
                        <Paper
                          w="25px"
                          h="25px"
                          radius="25px"
                          bg="var(--mantine-primary-color-light-color)"
                          style={{
                            textAlign: "center",
                            alignContent: "center",
                          }}
                        >
                          {form.values.items.length}
                        </Paper>
                      ) : undefined
                    }
                    onClick={() => {
                      if (form.values.items.length === 0) {
                        form.setFieldValue(
                          "items",
                          items.map((i) => ({
                            loanId: loanId,
                            itemId: i.itemId,
                          }))
                        );
                      } else {
                        if (form.isValid()) {
                          Promise.all([
                            statusField.validate(),
                            dateReturnedField.validate(),
                            returnedByField.validate(),
                          ]).then((results) => {
                            notifications.show({
                              id: notificationId,
                              message: `Signing-in items for loan ${loanId}...`,
                              loading: true,
                              autoClose: false,
                              withCloseButton: true,
                            });
                            fetcher.submit(
                              JSON.stringify({
                                person: {
                                  id: loanData.data?.person.id,
                                },
                                items: form.values.items.map((i) => ({
                                  loanId: i.loanId,
                                  itemId: i.itemId,
                                  status: statusField.getValue() ?? "returned",
                                  dateReturned:
                                    i.status !== "out"
                                      ? dateReturnedField.getValue() ?? new Date()
                                      : null,
                                  returnedById:
                                    returnedByField.getValue() ?? loanData.data?.person.id,
                                })),
                              } as LoanFormType),
                              {
                                action: `/loans/${loanId}`,
                                method: "PATCH",
                                encType: "application/json",
                              }
                            );
                          });
                        }
                      }
                    }}
                  >
                    {form.values.items.length > 0
                      ? items.filter((i) => i.dateReturned === null).length > 0
                        ? "Sign-In Item"
                        : "Update Item" + (form.values.items.length > 1 ? "s" : "")
                      : "Select All"}
                  </Button>
                )}
            </>
          )
        )
      ) : (
        <Skeleton h={200} />
      )}
    </Flex>
  );
}
