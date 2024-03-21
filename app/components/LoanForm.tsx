import {
  ActionIcon,
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
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import {
  ItemFormValues,
  PersonFormValues,
  findItem,
  findPerson,
} from "~/lib/test-data";
import SearchForm from "./SearchForm";
import ItemTable from "./items/ItemTable";

export default function LoanForm({
  onSubmit,
}: {
  onSubmit?: (person: PersonFormValues, items: ItemFormValues[]) => void;
}) {
  const loanForm = useForm<{
    person: PersonFormValues | undefined;
    items: ItemFormValues[];
  }>({
    initialValues: {
      person: undefined,
      items: [],
    },
    validate: {
      person: (value, values) => {
        if (value === undefined) return "Need to select person";
      },
      items: (value, values) => {
        if (value.length === 0) return "Need at least one item";
      },
    },
  });
  const [loading, setLoading] = useState(false);

  function addItem(item: ItemFormValues): Promise<ItemFormValues> {
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve(item);
      }, 1000);
    });
  }

  function removeItem(item: ItemFormValues): Promise<ItemFormValues> {
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve(item);
      }, 1000);
    });
  }

  return (
    <Flex w="100%" h="100%" direction="column">
      <Fieldset legend="Person" disabled={loading} h="min-content">
        {loanForm.values.person ? (
          <Flex direction="row" w="100%">
            <Text
              w="100%"
              size="sm"
            >{`${loanForm.values.person.firstName} ${loanForm.values.person.lastName}`}</Text>
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
            mapItems={(value: string, item: PersonFormValues) => (
              <Combobox.Option
                value={`${item.firstName} ${item.lastName}`}
                key={item.id}
              >
                <Highlight highlight={value}>
                  {`${item.firstName} ${item.lastName}`}
                </Highlight>
              </Combobox.Option>
            )}
            onComboboxSearch={(value) => {
              return findPerson({ name: value }).then((result) => {
                const itemMap = new Map();
                result.forEach((r) =>
                  itemMap.set(`${r.firstName} ${r.lastName}`, r)
                );

                return itemMap;
              });
            }}
            onSubmit={(item) => {
              setLoading(true);
              findPerson({ ...item }).then((result) => {
                setLoading(false);
                if (result.length > 0) {
                  // TODO - Add Confirmation
                  loanForm.setFieldValue("person", result[0]);
                } else {
                  loanForm.setFieldError("person", "No results")
                }
              });
            }}
          />
        )}
      </Fieldset>
      <Fieldset legend="Items" disabled={loading} p="sm" h="100%">
        <Box pos="relative" h="100%">
          <LoadingOverlay
            visible={loading}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          <Flex direction="column">
            <ScrollArea h="calc(100dvh - 30rem)">
              <ItemTable
                items={loanForm.values.items}
                loading={loading}
                onRemoveItem={(item, index) => {
                  setLoading(true);
                  removeItem(item).then((value) => {
                    setLoading(false);
                    loanForm.removeListItem("items", index);
                  });
                }}
              />
            </ScrollArea>
            <Divider mb="md" />
            <SearchForm
              mapItems={(value: string, item: ItemFormValues) =>
                item.name ? (
                  <Combobox.Option value={item.name} key={item.id}>
                    <Highlight highlight={value}>{item.name}</Highlight>
                  </Combobox.Option>
                ) : (
                  <Text>Unknown</Text>
                )
              }
              onComboboxSearch={(value) => {
                return findItem({ name: value }).then((result) => {
                  const itemMap = new Map();
                  console.log(result);
                  result.forEach((r) => {
                    itemMap.set(r.name, r);
                  });
                  return itemMap;
                });
              }}
              onSubmit={(item) => {
                setLoading(true);
                findItem(item).then((result) => {
                  if (result.length > 0) {
                    if (
                      loanForm.values.items.find((i) => i.id === result[0].id)
                    ) {
                      loanForm.setFieldError("items", "Item already exists")
                    } else {
                      // TODO - Add Confirmation
                      loanForm.insertListItem("items", result[0]);
                    }
                  } else {
                    loanForm.setFieldError("items", "No results")
                  }

                  setLoading(false);
                });
              }}
            />
          </Flex>
        </Box>
      </Fieldset>
      <Group justify="end">
        <form
          onSubmit={loanForm.onSubmit((values) => {
            onSubmit?.(values.person!, values.items);
          }, (errors, values) => {
            notifications.show({
              id: 'error',
              color: "red",
              message: 'Failed',
              autoClose: 1000
            })
          })}
        >
          <Button type="submit" disabled={loading}>
            Submit
          </Button>
        </form>
      </Group>
    </Flex>
  );
}
