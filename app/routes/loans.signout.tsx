import {
  ActionIcon,
  Box,
  Button,
  Card,
  CloseButton,
  Combobox,
  Divider,
  Fieldset,
  Flex,
  Group,
  List,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Item, Person } from "@prisma/client";
import { useActionData, useFetcher, useNavigate } from "@remix-run/react";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import SearchForm, { SearchFormValues } from "~/components/SearchForm";
import ItemTable from "~/components/items/ItemTable";
import ItemView from "~/components/items/ItemView";
import PersonView from "~/components/people/PersonView";
import { dateDiff, formatDate, fullName } from "~/lib/utils";
import { ItemWithCount, loader as itemsLoader } from "./items";
import { loader as itemLoader } from "./items.$itemId";
import { action } from "./loans";
import { PersonWithCount, loader as peopleLoader } from "./people";
import { loader as personLoader } from "./people.$personId";

interface LoanFormValues {
  person: Person | undefined;
  items: Item[];
}

interface LoanDataValues {
  people: PersonWithCount[];
  items: ItemWithCount[];
  loading?: boolean | false;
}

// TODO - Error fields
// TODO - New item creation
// TODO - New person creation
// TODO - move all functions and mapping outside of return
// TODO - saving form data
// TODO - prevent going back to previous page during form
// TODO - prevent navigation from scanner
// TODO - implement form id page
// TODO - implement importing and exporting data

export default function Page() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const actionData = useActionData<typeof action>();

  const searchPeopleFetcher = useFetcher<typeof peopleLoader>();
  const searchItemsFetcher = useFetcher<typeof itemsLoader>();

  const submitPersonFetcher = useFetcher<typeof personLoader>();
  const submitItemFetcher = useFetcher<typeof itemLoader>();

  useEffect(() => {
    if (submitPersonFetcher.state === "idle" && submitPersonFetcher.data) {
      const outstandingLoans = submitPersonFetcher.data.loans.filter(
        (loan) => loan._count.items > 0
      );
      if (outstandingLoans.length > 0) {
        const person = submitPersonFetcher.data;
        modals.openConfirmModal({
          title: "Outstanding Loans",
          children: (
            <Stack>
              <Text c="red">
                {fullName(person)} already has {outstandingLoans.length} loans
                out!
              </Text>
              <List>
                {outstandingLoans.map((loan) => (
                  <List.Item>
                    <Text>
                      {formatDate(loan.createdDate)} - {loan.items.length} items
                    </Text>
                    <Text>{dateDiff(loan.createdDate)}</Text>
                  </List.Item>
                ))}
              </List>
              <Text>
                Are you sure you want to create a new loan for{" "}
                {person.firstName}?
              </Text>
            </Stack>
          ),
          labels: {
            confirm: "Yes",
            cancel: "No",
          },
          onConfirm: () => {
            loanForm.setFieldValue("person", {
              ...person,
              createdDate: new Date(person.createdDate),
              updatedDate: new Date(person.updatedDate),
            });
          },
          onCancel: () => {
            loanForm.setFieldValue("person", undefined);
          },
        });
      } else {
        loanForm.setFieldValue("person", {
          ...submitPersonFetcher.data,
          createdDate: new Date(submitPersonFetcher.data.createdDate),
          updatedDate: new Date(submitPersonFetcher.data.updatedDate),
        });
      }
    }
  }, [submitPersonFetcher.state]);

  useEffect(() => {
    if (submitItemFetcher.data) {
      loanForm.insertListItem("items", {
        ...submitItemFetcher.data,
        createdDate: new Date(submitItemFetcher.data.createdDate),
        updatedDate: new Date(submitItemFetcher.data.updatedDate),
      });
    }
  }, [submitItemFetcher.state]);

  const loading =
    searchItemsFetcher.state === "loading" ||
    searchPeopleFetcher.state === "loading";

  /**
   * Form values
   */
  const loanForm = useForm<LoanFormValues>({
    initialValues: {
      person: undefined,
      items: [],
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

  /**
   * Current search prompts for person
   */
  const [personSearch, setPersonSearch] = useState<SearchFormValues>({
    qrCode: "",
    name: "",
  });
  /**
   * Current search prompts for item
   */
  const [itemSearch, setItemSearch] = useState<SearchFormValues>({
    qrCode: "",
    name: "",
  });

  //#region Options

  /**
   * Options that display when the user searches for people
   */
  const personSearchOptions =
    searchPeopleFetcher.data && searchPeopleFetcher.data.length > 0 ? (
      searchPeopleFetcher.data.map((person) => {
        return (
          <Combobox.Option value={person.id.toString()} key={person.id}>
            <>
              <PersonView
                highlight={personSearch.name ? personSearch.name : ""}
                person={{
                  ...person,
                  createdDate: new Date(person.createdDate),
                  updatedDate: new Date(person.updatedDate),
                }}
              />
              <Divider mt="sm"/>
            </>
          </Combobox.Option>
        );
      })
    ) : (
      <Combobox.Empty>No results</Combobox.Empty>
    );

  /**
   * Options that display when the user searches for items
   */
  const itemSearchOptions =
    searchItemsFetcher.data && searchItemsFetcher.data.length > 0 ? (
      searchItemsFetcher.data.map((item) => (
        <Combobox.Option
          value={item.id.toString()}
          key={item.id}
          disabled={item._count.loans > 0}
        >
          <>
            <ItemView
              highlight={itemSearch.name ? itemSearch.name : ""}
              item={item}
            />
            <Divider mt="sm"/>
          </>
        </Combobox.Option>
      ))
    ) : (
      <Combobox.Empty>No results</Combobox.Empty>
    );

  //#endregion Options

  function updateData(path: "person" | "item", value: SearchFormValues) {
    switch (path) {
      case "person":
        setPersonSearch({ ...personSearch, ...value });
        break;
      case "item":
        setItemSearch({ ...itemSearch, ...value });
        break;
    }

    console.log("%s data updated with %s", path, JSON.stringify(value));

    return dataSearch(path, value);
  }

  function dataSearch(path: "person" | "item", value: SearchFormValues) {
    if (
      value &&
      ((value.qrCode && value.qrCode.length >= 2) ||
        (value.name && value.name.length >= 2))
    ) {
      const searchParams = value.qrCode
        ? `qrCode=${value.qrCode}`
        : `query=${value.name}`;

      switch (path) {
        case "person":
          searchPeopleFetcher.load(`/people?${searchParams}`);
          break;
        case "item":
          searchItemsFetcher.load(`/items?${searchParams}`);
          break;
        default:
          console.error(`${path} is not a valid path for searching`);
          return false;
      }
    } else {
      switch (path) {
        case "person":
          searchPeopleFetcher.load("");
          break;
        case "item":
          searchItemsFetcher.load("");
          break;
      }

      return false;
    }

    return true;
  }

  function handleItemSelect(
    path: "person" | "item",
    value: string
  ): SearchFormValues {
    let result: SearchFormValues = {};

    try {
      switch (path) {
        case "person": {
          result = personSearch;
          break;
        }
        case "item": {
          result = itemSearch;
          break;
        }
      }
    } catch (e) {
      console.error("Failed to parse selected item for %s", path, e);
    }

    handleDataSubmit(path, value);

    return result;
  }

  function handleDataSubmit(path: "loan" | "person" | "item", value: string) {
    try {
      switch (path) {
        case "loan":
          fetcher.submit(value, {
            action: "/loans",
            method: "POST",
            encType: "application/json",
            navigate: false,
          });
          break;
        case "person":
          submitPersonFetcher.load(`/people/${parseInt(value)}`);
          break;
        case "item":
          submitItemFetcher.load(`/items/${parseInt(value)}`);
          break;
      }
    } catch (e) {
      console.error("Failed to submit search result", e);
      loanForm.setFieldError(path, `Failed to find ${path}`);
    }
  }

  return (
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
      <Flex w="100%" h="100%" direction="column">
        <Fieldset legend="Person" h="min-content">
          <Box pos="relative" h="100%">
            <LoadingOverlay
              visible={searchPeopleFetcher.state != "idle"}
              zIndex={1000}
              overlayProps={{ radius: "sm", blur: 2 }}
            />
            {loanForm.values.person ? (
              <Flex direction="row" w="100%">
                <Text w="100%" size="sm">
                  {`${loanForm.values.person.firstName} ${loanForm.values.person.lastName}`}
                </Text>
                <ActionIcon
                  style={{ justifySelf: "end" }}
                  size="sm"
                  color="red"
                  onClick={() => loanForm.setFieldValue("person", undefined)}
                >
                  <IconEdit />
                </ActionIcon>
              </Flex>
            ) : (
              <SearchForm
                formData={{
                  placeholder: {
                    qrCode: "Enter QR Code",
                    name: "Enter person's name",
                  },
                  description: {
                    name: "Search for person using their name",
                  },
                }}
                onQRCodeChanged={(value) =>
                  updateData("person", { qrCode: value })
                }
                onNameChanged={(value) => updateData("person", { name: value })}
                onItemSelect={(value) => handleItemSelect("person", value)}
                submitHidden
              >
                {personSearchOptions}
              </SearchForm>
            )}
          </Box>
        </Fieldset>
        <Fieldset legend="Items" p="sm" h="100%">
          <Box pos="relative" h="100%">
            <LoadingOverlay
              visible={searchItemsFetcher.state != "idle"}
              zIndex={1000}
              overlayProps={{ radius: "sm", blur: 2 }}
            />
            <Flex direction="column">
              <ScrollArea h="calc(100dvh - 30rem)">
                <ItemTable
                  items={loanForm.values.items}
                  onRemoveItem={(item, index) => {
                    loanForm.removeListItem("items", index);
                  }}
                />
              </ScrollArea>
              <Divider mb="md" />
              <SearchForm
                onQRCodeChanged={(value) =>
                  updateData("item", { qrCode: value })
                }
                onNameChanged={(value) => updateData("item", { name: value })}
                onItemSelect={(value) => handleItemSelect("item", value)}
                submitHidden
              >
                {itemSearchOptions}
              </SearchForm>
            </Flex>
          </Box>
        </Fieldset>
        <Group mt="sm" justify="end">
          <form
            onSubmit={loanForm.onSubmit(
              (values) => {
                handleDataSubmit("loan", JSON.stringify(values));
              },
              (errors, values) => {
                notifications.show({
                  id: "error",
                  color: "red",
                  message: "Failed",
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
  );
}
