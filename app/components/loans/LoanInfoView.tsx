import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Fieldset,
  Flex,
  Group,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useToggle } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Tag } from "@prisma/client";
import { Link, useNavigate } from "@remix-run/react";
import { IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { LoanPatchValues, loader } from "~/routes/loans.$loanId";
import {
  ItemFindOne,
  LoanFindOne,
  LoanedItemInclude,
  PersonFindOne,
} from "~/utils/types.server";
import { dateDiff, formatDate, fullName } from "~/utils/utils";
import EditButtons from "../EditButtons";
import InfoView from "../InfoView";
import SearchItemForm from "../items/SearchItemForm";
import SearchPersonForm from "../people/SearchPersonForm";
import TagCombobox from "../tags/TagCombobox";

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

  const [person, setPerson] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    nickname: string | null;
    role: { name: string; color: string };
  }>();
  const [items, setItems] = useState<LoanedItemInclude[]>();
  const [notes, setNotes] = useState("");

  const [editStatus, toggleEditStatus] = useToggle([
    "none",
    "tags",
    "person",
    "items",
    "items-returnedBy",
    "notes",
  ] as const);

  const form = useForm<LoanPatchValues>();

  const infoLoading = loading || !loan;

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
          children: `Would you like to update who returned the items with ${fullName(
            person
          )}`,
          labels: {
            confirm: "Yes",
            cancel: "No",
          },
          onConfirm: () => {
            const newIds: { id: number; returnedById: number }[] = [];

            const newItems = items.map((item) => {
              newIds.push({
                id: item.itemId,
                returnedById: person.id,
              });

              return {
                ...item,
                returnedById: person.id,
                returnedBy: person,
              };
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
      rightSection={
        editStatus == "none" ? (
          <>
            {loan.tags.map((t) => (
              <Badge key={t.id} color={t.color} autoContrast>
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
      <Flex
        direction="column"
        w="100%"
        style={{ flexGrow: "1" }}
        gap="sm"
        py="sm"
      >
        {/* Person */}
        <Fieldset legend="Person">
          <Flex
            align="center"
            direction="row"
            justify="space-between"
            wrap="nowrap"
          >
            <Text
              ta="center"
              fw="bold"
              truncate="end"
              component={Link}
              to={`/people/${person?.id}`}
              style={{ cursor: "pointer" }}
            >
              {person ? fullName(person) : "Unknown"}
            </Text>
            <Group align="center" style={{ flexWrap: "nowrap" }}>
              {person && person.role && (
                <Badge color={person.role.color} autoContrast>
                  {person.role.name}
                </Badge>
              )}
              {/* Edit Person */}
              {editStatus == "none" ? (
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
                editButton(true)
              )}
            </Group>
          </Flex>
          {editStatus == "person" && (
            <SearchPersonForm autoFocus onResult={updatePerson} />
          )}
        </Fieldset>
        {/* Items */}
        <Fieldset legend="Items">
          {items && items.length > 0 ? (
            items.map((i) => {
              // Finds the form value (if it exists)
              const formValue = form.values.itemIds?.find(
                (id) => id.id == i.itemId || id.newId == i.itemId
              );

              // Used when the item list gets modified so that the SearchItemForm doesn't get destroyed
              const itemId = formValue?.newId ? formValue.id : i.itemId;

              // Determines if this item is the one currently being edited
              const editing =
                (editStatus == "items" || editStatus == "items-returnedBy") &&
                formValue != undefined;

              return (
                <Stack key={itemId} gap={0} mb="sm">
                  <Flex
                    direction="row"
                    wrap="nowrap"
                    align="center"
                    justify="space-between"
                  >
                    <Text
                      ta="center"
                      fw="bold"
                      truncate="end"
                      component={Link}
                      to={`/items/${i.itemId}`}
                      style={{ cursor: "pointer" }}
                    >
                      {i.item.name}
                    </Text>
                    <Group style={{ flexWrap: "nowrap" }}>
                      <Badge
                        color={i.dateReturned ? "green" : "red"}
                        autoContrast
                      >
                        {i.dateReturned ? "In" : "Out"}
                      </Badge>
                      {/* Edit Item */}
                      {editStatus == "none" ? (
                        <ActionIcon
                          variant="subtle"
                          onClick={() => editItem(i)}
                          disabled={editStatus != "none"}
                        >
                          <IconEdit />
                        </ActionIcon>
                      ) : (
                        editButton(true)
                      )}
                    </Group>
                  </Flex>
                  {i.item.description && (
                    <Text size="sm" lineClamp={2} truncate="end" fs="italic">
                      {i.item.description}
                    </Text>
                  )}
                  {i.dateReturned ? (
                    <Text size="xs">
                      Returned: {formatDate(i.dateReturned)} (
                      {dateDiff(i.dateReturned)})
                    </Text>
                  ) : i.dateLoaned ? (
                    <Text size="xs">
                      Last Seen: {formatDate(i.dateLoaned)} (
                      {dateDiff(i.dateLoaned)})
                    </Text>
                  ) : (
                    <Text size="xs">Unknown</Text>
                  )}
                  {i.returnedBy && (
                    <Text size="xs">
                      Returned by:{" "}
                      <Text
                        span
                        inherit
                        fw="bold"
                        {...(i.returnedById != loan.personId && {
                          c: "error",
                        })}
                      >
                        {fullName(i.returnedBy)}
                      </Text>
                    </Text>
                  )}
                  <Box mt="sm">
                    {
                      //#region Item Edit
                      editing && editStatus == "items" ? (
                        <SearchItemForm
                          autoFocus
                          filterItems={(searchItems) =>
                            searchItems.filter((item) => item._count.loans == 0)
                          }
                          disableItem={(item) =>
                            item.tags.find((t) =>
                              ["Broken", "Lost", "Missing"].includes(t.name)
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
                  </Box>
                </Stack>
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
              onClick={() => navigate(`/loans/signin?loanId=${loan.id}`)}
              disabled={!outstanding}
            >
              Sign-In Items
            </Button>
          )}
        </Fieldset>
        {/* Notes */}
        <Fieldset legend="Notes">
          <Textarea
            style={{ overflowY: "auto", flexGrow: "1" }}
            size="fit-content"
            autosize
            minRows={7}
            maxRows={15}
            disabled={editStatus != "none" && editStatus != "notes"}
            onBlur={() => {}}
            value={notes}
            onChange={(event) => updateNotes(event.target.value)}
          />
          {editStatus == "notes" && editButton()}
        </Fieldset>
      </Flex>
    </InfoView>
  );
}
