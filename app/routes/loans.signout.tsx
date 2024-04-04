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
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure, useToggle } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useActionData, useNavigate } from "@remix-run/react";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import SearchForm, { SearchFormValues } from "~/components/SearchForm";
import CreateItemForm from "~/components/items/CreateItemForm";
import ItemComboView from "~/components/items/ItemComboView";
import ItemTable from "~/components/items/ItemTable";
import CreatePersonForm from "~/components/people/CreatePersonForm";
import PersonView from "~/components/people/PersonComboView";
import { ItemFindMany, PersonFindOne } from "~/utils/types.server";
import { dateDiff, formatDate, fullName } from "~/utils/utils";
import { action as itemAction, loader as itemsLoader } from "./items";
import { loader as itemLoader } from "./items.$itemId";
import { action as loanAction } from "./loans";
import { loader as peopleLoader } from "./people";
import { loader as personLoader } from "./people.$personId";
import { loader as tagsLoader } from "./tags";

interface LoanFormValues {
  person: PersonFindOne | undefined;
  items: ItemFindMany[];
}

// TODO - Allow adding tags to loan
// TODO - Move some fetchers into this page's loader
// TODO - saving form data
// TODO - prevent going back to previous page during form
// TODO - create components for searching person and items with the SearchForm
// TODO - load items on search

export default function Page() {
  const navigate = useNavigate();
  const fetcher = useTypedFetcher();
  const submitLoan = useActionData<typeof loanAction>();

  const searchPeopleFetcher = useTypedFetcher<typeof peopleLoader>();
  const searchItemsFetcher = useTypedFetcher<typeof itemsLoader>();
  const searchTagsFetcher = useTypedFetcher<typeof tagsLoader>();

  const submitPersonFetcher = useTypedFetcher<typeof personLoader>();
  const submitItemFetcher = useTypedFetcher<typeof itemLoader>();

  const submitNewPerson = useTypedFetcher<typeof itemAction>();
  const submitNewItem = useTypedFetcher<typeof itemAction>();

  const [opened, { open, close }] = useDisclosure(false);
  const [createType, toggleCreateType] = useToggle(["person", "item"]);

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
                person={person}
              />
              <Divider mt="sm" />
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
          disabled={
            item._count.loans > 0 ||
            loanForm.values.items.find((i) => i.id == item.id) != undefined
          }
        >
          <>
            <ItemComboView
              highlight={itemSearch.name ? itemSearch.name : ""}
              item={item}
            />
            <Divider mt="sm" />
          </>
        </Combobox.Option>
      ))
    ) : (
      <Combobox.Empty>No results</Combobox.Empty>
    );

  //#endregion Options

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

  useEffect(() => {
    if (submitPersonFetcher.state === "idle" && submitPersonFetcher.data) {
      const outstandingLoans = submitPersonFetcher.data.loans.filter(
        (loan) => loan.items.find((i) => !i.dateReturned) != undefined
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
            loanForm.setFieldValue("person", person);
          },
          onCancel: () => {
            loanForm.setFieldValue("person", undefined);
          },
        });
      } else {
        loanForm.setFieldValue("person", submitPersonFetcher.data);
      }
    }
  }, [submitPersonFetcher.data]);

  useEffect(() => {
    if (
      submitItemFetcher.state === "idle" &&
      submitItemFetcher.data &&
      loanForm.values.items.filter((i) => i.id == submitItemFetcher.data.id)
        .length == 0
    ) {
      loanForm.insertListItem("items", {
        ...submitItemFetcher.data,
        createdDate: new Date(submitItemFetcher.data.createdDate),
        updatedDate: new Date(submitItemFetcher.data.updatedDate),
      });
    }
  }, [submitItemFetcher.data]);

  // updates on new person creation
  useEffect(() => {
    if (submitNewPerson.state === "idle" && submitNewPerson.data) {
      handleItemSelect("person", submitNewPerson.data.id.toString());
      close();
    }
  }, [submitNewPerson.state, submitNewPerson.data]);

  // updates on new person creation
  useEffect(() => {
    if (submitNewItem.state === "idle" && submitNewItem.data) {
      handleItemSelect("item", submitNewItem.data.id.toString());
      close();
    }
  }, [submitNewItem.state, submitNewItem.data]);

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

    if (value === "$create") {
      handleDataCreation(path);
    } else {
      handleDataSubmit(path, value);
    }

    return {};
  }

  function handleDataCreation(path: "person" | "item") {
    searchTagsFetcher.load("");
    toggleCreateType(path);
    open();
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
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={createType == "person" ? "Create New Person" : "Create New Item"}
      >
        {createType == "person" ? (
          <CreatePersonForm
            onTagSearch={(value) => {
              searchTagsFetcher.load(`/tags?category=Person Role&q=${value}`);
            }}
            onSubmit={(values) => {
              modals.openConfirmModal({
                id: "person-create-confirm",
                title: "Confirm Creation",
                centered: true,
                children: (
                  <Text>
                    Are you sure you want to create a new person named{" "}
                    {fullName(values)}?
                  </Text>
                ),
                labels: {
                  confirm: "Yes",
                  cancel: "No",
                },
                onConfirm: () => {
                  modals.close("person-create-confirm");
                  submitNewPerson.submit(values, {
                    action: "/people",
                    method: "POST",
                    navigate: false,
                    encType: "application/json",
                  });
                },
                onCancel: () => {
                  modals.close("item-create-confirm");
                },
              });
            }}
            loading={submitNewPerson.state !== "idle"}
            tags={searchTagsFetcher.data}
          />
        ) : (
          createType == "item" && (
            <CreateItemForm
              onTagSearch={(value) => {
                searchTagsFetcher.load(`/tags?category=Item Type&q=${value}`);
              }}
              onSubmit={(values) => {
                modals.openConfirmModal({
                  id: "item-create-confirm",
                  title: "Confirm Creation",
                  centered: true,
                  children: (
                    <Text>
                      Are you sure you want to create a new item named{" "}
                      {values.name}?
                    </Text>
                  ),
                  labels: {
                    confirm: "Yes",
                    cancel: "No",
                  },
                  onConfirm: () => {
                    modals.close("item-create-confirm");
                    submitNewItem.submit(values, {
                      action: "/items",
                      method: "POST",
                      navigate: false,
                      encType: "application/json",
                    });
                  },
                  onCancel: () => {
                    modals.close("item-create-confirm");
                  },
                });
              }}
              loading={submitNewItem.state !== "idle"}
              tags={searchTagsFetcher.data}
            />
          )
        )}
      </Modal>
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
          <Fieldset
            legend="Person"
            h="min-content"
            {...(loanForm.errors.items && { style: { borderColor: "red" } })}
          >
            <Box pos="relative" h="100%">
              <LoadingOverlay
                visible={
                  searchPeopleFetcher.state !== "idle" ||
                  submitPersonFetcher.state !== "idle"
                }
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
                  onNameChanged={(value) =>
                    updateData("person", { name: value })
                  }
                  onItemSelect={(value) => handleItemSelect("person", value)}
                  onCreateButton={() => {
                    handleDataCreation("person");
                    return true;
                  }}
                  submitHidden
                >
                  {personSearchOptions}
                </SearchForm>
              )}
            </Box>
          </Fieldset>
          <Text
            my="sm"
            size="xs"
            c="red"
            hidden={loanForm.errors.person == undefined}
          >
            {loanForm.errors.person}
          </Text>
          <Fieldset
            legend="Items"
            p="sm"
            h="100%"
            {...(loanForm.errors.items && { style: { borderColor: "red" } })}
          >
            <Box pos="relative" h="100%">
              <LoadingOverlay
                visible={
                  searchItemsFetcher.state !== "idle" ||
                  submitItemFetcher.state !== "idle"
                }
                zIndex={1000}
                overlayProps={{ radius: "sm", blur: 2 }}
              />
              <Flex direction="column" h="100%">
                <ItemTable
                  items={loanForm.values.items}
                  onRemoveItem={(item, index) => {
                    loanForm.removeListItem("items", index);
                  }}
                />
                <Divider mb="md" />
                <SearchForm
                  onQRCodeChanged={(value) =>
                    updateData("item", { qrCode: value })
                  }
                  onNameChanged={(value) => updateData("item", { name: value })}
                  onItemSelect={(value) => handleItemSelect("item", value)}
                  onCreateButton={() => {
                    handleDataCreation("item");
                    return true;
                  }}
                  submitHidden
                >
                  {itemSearchOptions}
                </SearchForm>
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
                  handleDataSubmit("loan", JSON.stringify(values));
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
