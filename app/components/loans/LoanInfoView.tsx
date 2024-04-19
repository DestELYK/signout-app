import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Fieldset,
  Flex,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useToggle } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Tag } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import { IconArrowLeft, IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { LoanPatchValues, loader } from "~/routes/loans.$loanId";
import {
  ItemFindOne,
  LoanFindOne,
  LoanedItemInclude,
  PersonFindOne,
} from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";
import EditButtons from "../EditButtons";
import InfoView from "../InfoView";
import LoanedItemInfoView from "../items/LoanedItemInfoView";
import SearchItemForm from "../items/SearchItemForm";
import PersonInfoView from "../people/PersonInfoView";
import SearchPersonForm from "../people/SearchPersonForm";
import TagCombobox from "../tags/TagCombobox";

import classes from "./LoanInfoView.module.css";

export interface LoanInfoViewProps {
  loan: LoanFindOne;
  loading?: boolean;
}

export type LoanInfoViewFormValues = {
  person?: PersonFindOne;
  items?: LoanedItemInclude[];
  notes?: string;
  tags?: Tag[];
};

export default function LoanInfoView({ loan, loading }: LoanInfoViewProps) {
  const navigate = useNavigate();
  const fetcher = useTypedFetcher<typeof loader>();

  const [tags, setTags] = useState<{ name: string; color: string }[]>([]);
  const [person, setPerson] = useState<{
    id: number;
    qrCode?: string | null;
    firstName: string;
    lastName: string;
    nickname: string | null;
    tags: { name: string; color: string }[];
  }>();
  const [items, setItems] = useState<LoanedItemInclude[]>();
  const [notes, setNotes] = useState<string>();

  const [editStatus, toggleEditStatus] = useToggle([
    "none",
    "tags",
    "person",
    "items",
    "items-returnedBy",
    "notes",
  ] as const);

  const form = useForm<LoanPatchValues>();

  const infoLoading = loading || loan == undefined;

  const outstanding =
    loan.items && loan.items.find((item) => !item.dateReturned) !== undefined;

  useEffect(() => {
    if (fetcher.data) {
      notifications.show({
        message: "Loan Updated",
      });
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (loan && editStatus == "none") {
      setTags(loan.tags);
      setPerson(loan.person);
      setItems(loan.items);
      setNotes(loan.notes);
    }
  }, [loan]);

  const editButton = (iconOnly = false) => (
    <EditButtons iconOnly={iconOnly} onRevert={reset} onSave={handleSave} />
  );

  function reset() {
    form.reset();

    toggleEditStatus("none");

    setPerson(loan.person);
    setItems(loan.items);
    setNotes(loan.notes);
  }

  function handleSave() {
    if (form.isValid()) {
      updateLoan(form.values);
    }
  }

  function updateTags(tags: Tag[]) {
    form.setFieldValue("tagIds", tags);
  }

  function editPerson() {
    toggleEditStatus("person");
  }

  function updatePerson(person?: PersonFindOne) {
    if (person) {
      if (items && items.find((item) => item.dateReturned)) {
        modals.openConfirmModal({
          title: "Update Items",
          children: `Would you like to update who returned the items with ${formatFullName(
            person
          )}?`,
          labels: {
            confirm: "Yes",
            cancel: "No",
          },
          onConfirm: () => {
            const newIds: { id: number; returnedById: number }[] = [];

            const newItems = items.map((item) => {
              if (item.dateReturned) {
                newIds.push({
                  id: item.itemId,
                  returnedById: person.id,
                });

                return {
                  ...item,
                  returnedById: person.id,
                  returnedBy: person,
                };
              } else {
                return item;
              }
            });

            form.setFieldValue("itemIds", newIds);

            setItems(newItems);
          },
          onCancel: () => {
            modals.closeAll();
          },
        });
      }

      form.setFieldValue("personId", person.id);
      setPerson(person);
    }
  }

  function editItem(item: LoanedItemInclude) {
    const edit = (mode: "item" | "returned", itemId: number) => {
      form.setFieldValue("itemIds", [{ id: itemId }]);

      toggleEditStatus(mode == "item" ? "items" : "items-returnedBy");
    };

    if (item.dateReturned) {
      modals.open({
        title: `Edit Item`,
        children: (
          <>
            <Text>What would you like to edit for {item.item.name}?</Text>
            <Group mt="sm" justify="end">
              <Button
                variant="outline"
                onClick={() => {
                  modals.closeAll();
                  edit("returned", item.itemId);
                }}
              >
                Person Returning Item
              </Button>
              <Button
                onClick={() => {
                  modals.closeAll();
                  edit("item", item.itemId);
                }}
              >
                Item
              </Button>
            </Group>
          </>
        ),
      });
    } else {
      edit("item", item.itemId);
    }
  }

  function updateItem(
    item: LoanedItemInclude,
    resultItem?: ItemFindOne,
    resultPerson?: PersonFindOne
  ) {
    const filteredItems = items
      ? items.filter((i) => i.itemId !== item.itemId)
      : [];

    if (resultItem) {
      form.setFieldValue("itemIds", [
        { id: item.itemId, newId: resultItem.id },
      ]);

      const oldItem = { ...item };
      oldItem.itemId = resultItem.id;
      oldItem.item = resultItem;

      setItems([...filteredItems, oldItem]);
    } else if (resultPerson) {
      form.setFieldValue("itemIds", [
        { id: item.itemId, returnedById: resultPerson.id },
      ]);

      const oldItem = { ...item };
      oldItem.returnedById = resultPerson.id;
      oldItem.returnedBy = resultPerson;

      setItems([...filteredItems, oldItem]);
    }
  }

  function updateNotes(notes: string) {
    if (notes.length === 0) {
      form.setFieldValue("notes", "");
    }

    form.setFieldValue("notes", notes);
    setNotes(notes);
    toggleEditStatus("notes");
  }

  function updateLoan(values: LoanPatchValues) {
    modals.openConfirmModal({
      title: "Update Loan",
      children: `Are you sure you want to update Loan #${loan.id}?`,
      labels: {
        confirm: "Yes",
        cancel: "No",
      },
      onConfirm: () => {
        toggleEditStatus("none");

        fetcher.submit(JSON.stringify(values), {
          method: "PATCH",
          encType: "application/json",
          action: `/loans/${loan.id}`,
          navigate: false,
        });
      },
      onCancel: () => {
        modals.closeAll();
      },
    });
  }

  return (
    <InfoView
      {...loan}
      title={`Loan #${loan.id}`}
      onClose={() => navigate("/loans")}
      loading={infoLoading}
      leftSection={
        <ActionIcon
          variant="subtle"
          onClick={() =>
            navigate(-1)
          }
        >
          <IconArrowLeft />
        </ActionIcon>
      }
      rightSection={
        editStatus == "none" ? (
          <>
            {tags.map((t) => (
              <Badge key={t.name} color={t.color} autoContrast>
                {t.name}
              </Badge>
            ))}
            <Badge color={outstanding ? "red" : "green"} autoContrast>
              {outstanding ? "Out" : "In"}
            </Badge>
            <ActionIcon
              variant="subtle"
              onClick={() => toggleEditStatus("tags")}
              disabled={editStatus != "none"}
            >
              <IconEdit />
            </ActionIcon>
          </>
        ) : (
          editStatus == "tags" && (
            <>
              <TagCombobox
                category="Loan Info"
                fieldInfo={{
                  placeholder: "Search for tag...",
                }}
                unstyled
                autoFocus
                error={form.getInputProps("tagIds").error}
                initialValue={loan.tags}
                onTagsChange={(tags) => {
                  updateTags(tags);
                }}
              />
              {editButton(true)}
            </>
          )
        )
      }
    >
      <ScrollArea.Autosize h="100%" scrollbars="y" type="auto">
        <Flex direction="column" w="100%" gap="sm">
          {/* Person */}
          {person != undefined ? (
            <Fieldset legend="Person" px="sm">
              {person ? (
                <PersonInfoView
                  personId={person.id}
                  qrCode={person.qrCode}
                  firstName={person.firstName}
                  lastName={person.lastName}
                  nickname={person.nickname}
                  tags={person.tags}
                  rightSection={
                    editStatus == "none" ? (
                      <ActionIcon
                        variant="subtle"
                        onClick={() => {
                          editPerson();
                        }}
                        disabled={editStatus != "none"}
                      >
                        <IconEdit />
                      </ActionIcon>
                    ) : (
                      editStatus == "person" && editButton(true)
                    )
                  }
                />
              ) : (
                <Skeleton h={30} w="100%" />
              )}
              {editStatus == "person" && (
                <Box mt="sm">
                  <SearchPersonForm autoFocus onResult={updatePerson} />
                </Box>
              )}
            </Fieldset>
          ) : (
            <Skeleton h={100} w="100%" />
          )}

          {/* Items */}
          {items != undefined ? (
            <Fieldset legend="Items" px="sm">
              {items.length > 0 ? (
                items.map((i) => {
                  // Finds the form value (if it exists)
                  const formValue = form.values.itemIds?.find(
                    (id) => id.id == i.itemId || id.newId == i.itemId
                  );

                  // Used when the item list gets modified so that the SearchItemForm doesn't get destroyed
                  const itemId = formValue?.newId ? formValue.id : i.itemId;

                  // Determines if this item is the one currently being edited
                  const editing =
                    (editStatus == "items" ||
                      editStatus == "items-returnedBy") &&
                    formValue != undefined;

                  return (
                    (editStatus == "none" ||
                      !editStatus.startsWith("items") ||
                      editing) && (
                      <LoanedItemInfoView
                        key={itemId}
                        id={i.itemId}
                        qrCode={i.item.qrCode}
                        name={i.item.name}
                        description={i.item.description}
                        dateLoaned={i.dateLoaned}
                        dateReturned={i.dateReturned}
                        returnedBy={i.returnedBy}
                        tags={i.item.tags}
                        showDetails={!editing}
                        showOutstanding={!editing}
                        rightSection={
                          editStatus == "none" ? (
                            <ActionIcon
                              variant="subtle"
                              onClick={() => editItem(i)}
                              disabled={editStatus != "none"}
                            >
                              <IconEdit />
                            </ActionIcon>
                          ) : (
                            editing && editButton(true)
                          )
                        }
                        children={
                          <Stack mt="sm" gap="sm">
                            {
                              //#region Item Edit
                              editing && editStatus == "items" ? (
                                <SearchItemForm
                                  autoFocus
                                  filterItems={(searchItems) =>
                                    searchItems.filter(
                                      (item) => item._count.loans == 0
                                    )
                                  }
                                  disableItem={(item) =>
                                    item.tags.find((t) =>
                                      ["Broken", "Lost", "Missing"].includes(
                                        t.name
                                      )
                                    ) != undefined
                                  }
                                  onResult={(item) => {
                                    updateItem(i, item);
                                  }}
                                />
                              ) : (
                                editing &&
                                editStatus == "items-returnedBy" && (
                                  <SearchPersonForm
                                    autoFocus
                                    onResult={(person) =>
                                      updateItem(i, undefined, person)
                                    }
                                  />
                                )
                              )
                              //#endregion
                            }
                          </Stack>
                        }
                      />
                    )
                  );
                })
              ) : (
                <Text>No items</Text>
              )}
              {/* Sign In Items Button */}
              {editStatus == "none" && (
                <Button
                  mt="sm"
                  fullWidth
                  onClick={() => navigate(`/loans/signin?loanId=${loan.id}`, {replace: true})}
                  disabled={!outstanding || !items || items.length == 0}
                >
                  Sign-In Items
                </Button>
              )}
            </Fieldset>
          ) : (
            <Skeleton h={300} w="100%" />
          )}

          {/* Notes */}
          {notes != undefined ? (
            <Fieldset legend="Notes" px="sm">
              <Textarea
                classNames={{ ...classes }}
                maxLength={512}
                disabled={editStatus != "none" && editStatus != "notes"}
                onBlur={() => {}}
                value={notes}
                {...(editStatus == "notes" && { mb: "sm" })}
                onChange={(event) => updateNotes(event.target.value)}
              />
              {editStatus == "notes" && editButton()}
            </Fieldset>
          ) : (
            <Skeleton h={200} w="100%" />
          )}
        </Flex>
      </ScrollArea.Autosize>
    </InfoView>
  );
}
