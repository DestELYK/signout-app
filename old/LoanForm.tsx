import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Combobox,
  Divider,
  Fieldset,
  Flex,
  Group,
  Highlight,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Item, Person } from "@prisma/client";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { fullName } from "~/lib/utils";
import { ItemWithCount } from "~/routes/items";
import { PersonWithCount } from "~/routes/people";
import SearchForm, { SearchFormValues } from "../app/components/SearchForm";
import ItemTable from "../app/components/items/ItemTable";

export interface LoanFormValues {
  person: Person | undefined;
  items: Item[];
}

export interface LoanDataValues {
  people: PersonWithCount[];
  items: ItemWithCount[];
  loading?: boolean | false;
}

export default function LoanForm({
  data,
  onPersonSearch,
  onItemSearch,
  onPersonChange,
  onItemAdd,
  onItemRemove,
  onSubmit,
}: {
  data?: LoanDataValues;
  onPersonSearch?: (value?: SearchFormValues) => void;
  onPersonChange?: (person: Person) => void;
  onItemSearch?: (value?: SearchFormValues) => void;
  onItemAdd?: (item: Item) => void;
  onItemRemove?: (index: number, item?: Item) => void;
  onSubmit?: (values: LoanFormValues) => void;
}) {
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
  const [personSearch, setPersonSearch] = useState<SearchFormValues>({
    qrCode: "",
    name: "",
  });
  const [itemSearch, setItemSearch] = useState<SearchFormValues>({
    qrCode: "",
    name: "",
  });

  return (
    <Flex w="100%" h="100%" direction="column">
      <Fieldset legend="Person" h="min-content">
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
            onQRCodeChanged={(value) => {
              if (value.length > 2) {
                setPersonSearch({ ...personSearch, qrCode: value });
                onPersonSearch?.(value ? { qrCode: value } : undefined);
              }
            }}
            onNameChanged={(value) => {
              if (value.length > 2) {
                setPersonSearch({ ...personSearch, name: value });
                onPersonSearch?.(value ? { name: value } : undefined);
              }
            }}
            onItemSelect={(value) => {
              const person: Person = JSON.parse(value);

              return {
                qrCode: person.qrCode == null ? undefined : person.qrCode,
                name: fullName(person),
              };
            }}
            onSubmit={(value) => {
              const person: PersonWithCount = JSON.parse(value);

              if (person._count.loans > 0) {
                modals.openConfirmModal({
                  title: "Outstanding Loans",
                  children: (
                    <Stack>
                      <Text c="red">
                        {fullName(person)} already has {person._count.loans}{" "}
                        loans out!
                      </Text>
                      <Text>Are you sure you want to create a new loan?</Text>
                    </Stack>
                  ),
                  labels: {
                    confirm: "Yes",
                    cancel: "No",
                  },
                  onConfirm: () => {
                    loanForm.setFieldValue("person", person);
                    onPersonChange?.(person);
                  },
                  onCancel: () => {
                    loanForm.setFieldValue("person", undefined);
                  },
                });
              } else {
                loanForm.setFieldValue("person", person);
                onPersonChange?.(person);
              }
            }}
          >
            {data && data.people.length > 0 ? (
              data.people.map((person) => {
                return (
                  <>
                    <Combobox.Option
                      value={JSON.stringify(person)}
                      key={person.id}
                    >
                      <Highlight
                        w="100%"
                        truncate="end"
                        highlight={personSearch.name ? personSearch.name : ""}
                        {...(person._count.loans > 0 ? { c: "red" } : {})}
                      >
                        {fullName(person)}
                      </Highlight>
                      <Flex direction="row" gap="sm" justify="space-between">
                        {person._count.loans > 0 ? (
                          <Badge
                            color="red"
                            style={{ justifySelf: "flex-start" }}
                          >
                            {person._count.loans} loan
                            {person._count.loans > 1 ? "s" : ""} out
                          </Badge>
                        ) : null}
                        <Badge
                          style={{ justifySelf: "flex-end" }}
                          miw="max-content"
                          ml="auto"
                          color={person.role === "Staff" ? "blue" : "green"}
                        >
                          {person.role}
                        </Badge>
                      </Flex>
                    </Combobox.Option>
                    <Divider />
                  </>
                );
              })
            ) : (
              <Combobox.Empty>No people found</Combobox.Empty>
            )}
          </SearchForm>
        )}
      </Fieldset>
      <Fieldset legend="Items" p="sm" h="100%">
        <Box pos="relative" h="100%">
          <LoadingOverlay
            visible={data?.loading}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          <Flex direction="column">
            <ScrollArea h="calc(100dvh - 30rem)">
              <ItemTable
                items={loanForm.values.items}
                onRemoveItem={(item, index) => {
                  loanForm.removeListItem("items", index);

                  onItemRemove?.(index, data?.items[index]);
                }}
              />
            </ScrollArea>
            <Divider mb="md" />
            <SearchForm
              onQRCodeChanged={(value) => {
                setItemSearch({ ...itemSearch, qrCode: value });
                onItemSearch?.(value ? { qrCode: value } : undefined);
              }}
              onNameChanged={(value) => {
                setItemSearch({ ...itemSearch, name: value });
                onItemSearch?.(value ? { name: value } : undefined);
              }}
              onItemSelect={(value) => {
                const item: Item = JSON.parse(value);

                return {
                  qrCode: item.qrCode == null ? undefined : item.qrCode,
                  name: item.name,
                };
              }}
              onSubmit={(value) => {
                const item: Item = JSON.parse(value);

                loanForm.insertListItem("items", item);
                onItemAdd?.(item);
              }}
            >
              {data?.items && data.items.length > 0 ? (
                data.items.map((item) => (
                  <Combobox.Option
                    value={JSON.stringify(item)}
                    key={item.id}
                    disabled={item._count.loans > 0}
                  >
                    <Group>
                      <Highlight
                        highlight={itemSearch.name ? itemSearch.name : ""}
                      >
                        {item.name}
                      </Highlight>
                      <Badge>{item.type}</Badge>
                    </Group>
                  </Combobox.Option>
                ))
              ) : (
                <Combobox.Empty>No items found</Combobox.Empty>
              )}
            </SearchForm>
          </Flex>
        </Box>
      </Fieldset>
      <Group justify="end">
        <form
          onSubmit={loanForm.onSubmit(
            (values) => {
              onSubmit?.(values);
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
            disabled={data?.loading}
            rightSection={<IconPlus />}
          >
            Create Loan
          </Button>
        </form>
      </Group>
    </Flex>
  );
}
