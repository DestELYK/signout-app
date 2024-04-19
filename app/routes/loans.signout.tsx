import {
  ActionIcon,
  Box,
  Button,
  Card,
  CloseButton,
  Divider,
  Fieldset,
  Flex,
  Group,
  List,
  LoadingOverlay,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Tag } from "@prisma/client";
import { MetaFunction, useNavigate, useRouteError } from "@remix-run/react";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect } from "react";
import { useTypedFetcher } from "remix-typedjson";
import ErrorPage from "~/components/ErrorPage";
import LoanedItemInfoView from "~/components/items/LoanedItemInfoView";
import SearchItemForm from "~/components/items/SearchItemForm";
import PersonInfoView from "~/components/people/PersonInfoView";
import SearchPersonForm from "~/components/people/SearchPersonForm";
import { ItemFindMany, PersonFindOne } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import { action as loanAction } from "./loans";

interface LoanFormValues {
  person: PersonFindOne | undefined;
  items: ItemFindMany[];
  tags: Tag[];
}

// TODO - Allow adding tags to loan
// TODO - saving form data
// TODO - Fix item already added error when submitting

export const meta: MetaFunction = () => {
  return [{ title: "Loan Sign-Out" }];
};

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <Card padding="sm" radius="sm" withBorder w="100%" h="100%">
      <ErrorPage error={error} />
    </Card>
  );
}

export default function Page() {
  const navigate = useNavigate();
  const fetcher = useTypedFetcher<typeof loanAction>();

  const loading = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error) {
        notifications.show({
          message: fetcher.data.error,
          color: "red",
        });
      } else if (fetcher.data.loan) {
        notifications.show({
          message: "Created New Loan",
        });
        navigate(`/loans/${fetcher.data.loan.id}`);
      }
    }
  }, [fetcher.data]);

  /**
   * Form values
   */
  const loanForm = useForm<LoanFormValues>({
    initialValues: {
      person: undefined,
      items: [],
      tags: [],
    },
    validate: {
      person: (value) => {
        if (value === undefined) return "Need to select person";
      },
      items: (value) => {
        if (value.length === 0) return "Need at least one item";
      },
    },
  });

  useEffect(() => {
    const event = (event: BeforeUnloadEvent) => {
      // Cancel the event as stated by the standard.
      event.preventDefault();
      // Chrome requires returnValue to be set.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", event);

    return () => {
      window.removeEventListener("beforeunload", event);
    };
  });

  function insertItem(value?: ItemFindMany) {
    if (value) {
      console.log("Inserting item ", value);
      if (loanForm.values.items.find((i) => i.id === value.id)) {
        notifications.show({
          message: "Item has already been added",
          color: "red",
        });
      } else {
        loanForm.insertListItem("items", value);
      }
    }
  }

  function removeItem(value: ItemFindMany) {
    const index = loanForm.values.items.findIndex((i) => i.id == value.id);

    if (index != -1) {
      loanForm.removeListItem("items", index);
    } else {
      notifications.show({
        id: "remove-item",
        message: "Failed to find item to remove",
        color: "red",
      });
    }
  }

  function handleDataSubmit(value: string) {
    fetcher.submit(value, {
      action: "/loans",
      method: "POST",
      encType: "application/json",
      navigate: false,
    });
  }

  return (
    <>
      <LoadingOverlay visible={loading} zIndex={1000} />
      <Card withBorder h="100%" w="100%">
        <Card.Section withBorder inheritPadding px="xs" mb="sm">
          <Flex direction="row" justify="center" align="center">
            <Title w="100%" order={4} ta="center" fw="bold">
              Sign-Out Items
            </Title>
            <CloseButton
              size="xl"
              style={{ justifySelf: "flex-end" }}
              onClick={() => navigate("/loans")}
            />
          </Flex>
        </Card.Section>
        <Flex w="100%" h="100%" direction="column" gap="sm">
          <Fieldset
            disabled={loading}
            legend="Person"
            p="sm"
            {...(loanForm.errors.items && { style: { borderColor: "red" } })}
          >
            <Box pos="relative" h="100%">
              <LoadingOverlay
                zIndex={1000}
                overlayProps={{ radius: "sm", blur: 2 }}
              />
              {loanForm.values.person ? (
                <PersonInfoView
                  personId={loanForm.values.person.id}
                  qrCode={loanForm.values.person.qrCode}
                  firstName={loanForm.values.person.firstName}
                  lastName={loanForm.values.person.lastName}
                  nickname={loanForm.values.person.nickname}
                  tags={loanForm.values.person.tags}
                  rightSection={
                    <ActionIcon
                      style={{ justifySelf: "end" }}
                      size="sm"
                      color="red"
                      onClick={() =>
                        loanForm.setFieldValue("person", undefined)
                      }
                    >
                      <IconEdit />
                    </ActionIcon>
                  }
                />
              ) : (
                <SearchPersonForm
                  onResult={(value) => {
                    if (value) {
                      const outstandingLoans = value.loans.filter(
                        (loan) =>
                          loan.items.find((i) => !i.dateReturned) != undefined
                      );
                      if (outstandingLoans.length > 0) {
                        modals.openConfirmModal({
                          title: "Outstanding Loans",
                          children: (
                            <Stack>
                              <Text c="red">
                                {formatFullName(value)} already has{" "}
                                {outstandingLoans.length} loans out!
                              </Text>
                              <List>
                                {outstandingLoans.map((loan) => (
                                  <List.Item>
                                    <Text>
                                      {formatDate(loan.createdDate)} -{" "}
                                      {loan.items.length} items
                                    </Text>
                                    <Text>{dateDiff(loan.createdDate)}</Text>
                                  </List.Item>
                                ))}
                              </List>
                              <Text>
                                Are you sure you want to create a new loan for{" "}
                                {value.firstName}?
                              </Text>
                            </Stack>
                          ),
                          labels: {
                            confirm: "Yes",
                            cancel: "No",
                          },
                          onConfirm: () => {
                            loanForm.setFieldValue("person", value);
                          },
                          onCancel: () => {
                            loanForm.setFieldValue("person", undefined);
                          },
                        });
                      } else {
                        loanForm.setFieldValue("person", value);
                      }
                    }
                  }}
                />
              )}
            </Box>
          </Fieldset>
          <Text size="xs" c="red" hidden={loanForm.errors.person == undefined}>
            {loanForm.errors.person}
          </Text>
          <Fieldset
            disabled={loading}
            legend="Items"
            p="sm"
            h="100%"
            {...(loanForm.errors.items && { style: { borderColor: "red" } })}
          >
            <Box pos="relative" h="100%">
              <LoadingOverlay
                zIndex={1000}
                overlayProps={{ radius: "sm", blur: 2 }}
              />
              <Flex direction="column" h="100%">
                <Flex direction="column" mb="auto">
                  {loanForm.values.items.length > 0 ? (
                    loanForm.values.items.map((item) => (
                      <LoanedItemInfoView
                        key={item.id}
                        id={item.id}
                        qrCode={item.qrCode}
                        name={item.name}
                        description={item.description}
                        tags={item.tags}
                        rightSection={
                          <ActionIcon
                            size="input-sm"
                            variant="outline"
                            color="red"
                            onClick={() => removeItem(item)}
                          >
                            <IconTrash />
                          </ActionIcon>
                        }
                      />
                    ))
                  ) : (
                    <Text ta="center" m="auto">
                      Add item below
                    </Text>
                  )}
                </Flex>
                {/* <ItemTable
              items={loanForm.values.items}
              onRemoveItem={removeItem}
            /> */}
                <Divider mb="md" />
                <SearchItemForm
                  filterItems={(items) =>
                    items.map((i) => {
                      if (loanForm.values.items.find((i2) => i2.id == i.id)) {
                        if (!i.tags.find((t) => t.name === "Added")) {
                          i.tags.push({
                            name: "Added",
                            color: "red",
                          });
                        }
                      } else {
                        i.tags = i.tags.filter((t) => t.name !== "Added");
                      }
                      return i;
                    })
                  }
                  disableItem={(i) =>
                    i._count.loans > 0 ||
                    loanForm.values.items.find((i2) => i2.id == i.id) !=
                      undefined
                  }
                  onResult={insertItem}
                />
              </Flex>
            </Box>
          </Fieldset>
          <Text
            my="sm"
            size="xs"
            c="red"
            hidden={loanForm.errors.items == undefined}
          >
            {loanForm.errors.items}
          </Text>
          <Group mt="sm" justify="end">
            <form
              onSubmit={loanForm.onSubmit(
                (values) => {
                  handleDataSubmit(JSON.stringify(values));
                },
                (errors, values) => {
                  notifications.show({
                    id: "error",
                    color: "red",
                    message: "Failed to create loan",
                    autoClose: 1000,
                  });
                }
              )}
            >
              <Button
                type="submit"
                disabled={loading}
                rightSection={<IconPlus />}
              >
                Create Loan
              </Button>
            </form>
          </Group>
        </Flex>
      </Card>
    </>
  );
}
