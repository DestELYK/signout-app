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
import { Item, Person } from "@prisma/client";
import { IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import { fullName } from "~/lib/utils";
import SearchForm, { SearchFormValues } from "./SearchForm";
import ItemTable from "./items/ItemTable";

export interface LoanFormValues {
  person: Person | undefined;
  items: Item[];
}

export interface LoanDataValues {
  people: Person[];
  items: Item[];
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
  const [personSearch, setPersonSearch] = useState<SearchFormValues>();
  const [itemSearch, setItemSearch] = useState<SearchFormValues>();

  // const [itemSubmitted, setItemSubmitted] = useState(false);
  // const [personSubmitted, setPersonSubmitted] = useState(false);

  // const items = useFetcher<typeof itemLoader>();
  // const people = useFetcher<typeof personLoader>();

  // const loading = items.state === "loading" || people.state === "loading";

  // useEffect(() => {
  //   if (personSubmitted && people.state === "idle") {
  //     setPersonSubmitted(false);

  //     if (people.data && people.data.length > 0) {
  //       // @ts-ignore
  //       loanForm.setFieldValue("person", people.data[0]);
  //     }
  //   }
  // }, [personSubmitted, people.state]);

  // useEffect(() => {
  //   if (itemSubmitted && items.state === "idle") {
  //     setItemSubmitted(false);

  //     console.log('Submitted Item: %s', items.data);

  //     if (items.data && items.data.length > 0) {
  //       loanForm.insertListItem("items", items.data[0]);
  //     }
  //   }
  // }, [itemSubmitted, items.state]);

  // function findPerson(person: SearchFormValues) {
  //   const searchParams = person.qrCode
  //     ? `qrCode=${person.qrCode}`
  //     : `query=${person.name}`;

  //   people.load(`/people?${searchParams}`);
  //   setPersonSearch(person);
  // }

  // function findItem(item: SearchFormValues) {
  //   const searchParams = item.qrCode
  //     ? `qrCode=${item.qrCode}`
  //     : `query=${item.name}`;

  //   items.load(`/items?${searchParams}`);
  //   setItemSearch(item);
  // }

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
              onPersonSearch?.(value ? { qrCode: value } : undefined);
            }}
            onNameChanged={(value) => {
              onPersonSearch?.(value ? { name: value } : undefined);
            }}
            onItemSelect={(value) => {
              const person: Person = JSON.parse(value);

              return {
                qrCode: person.qrCode == null ? undefined : person.qrCode,
                name: fullName(person),
              };
            }}
            onSubmit={(value) => {
              const person: Person = JSON.parse(value);

              loanForm.setFieldValue("person", person);
              onPersonChange?.(person);
            }}
          >
            {data && data.people.length > 0 ? (
              data.people.map((person) => {
                return (
                  <Combobox.Option
                    value={JSON.stringify(person)}
                    key={person.id}
                  >
                    {personSearch && personSearch.name ? (
                      <Highlight highlight={personSearch.name}>
                        {fullName(person)}
                      </Highlight>
                    ) : (
                      fullName(person)
                    )}
                  </Combobox.Option>
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
                onItemSearch?.(value ? { qrCode: value } : undefined);
              }}
              onNameChanged={(value) => {
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
                data.items.map((item, index) => (
                  <Combobox.Option value={JSON.stringify(item)} key={index}>
                    {itemSearch && itemSearch.name ? (
                      <Highlight highlight={itemSearch.name}>
                        {item.name}
                      </Highlight>
                    ) : (
                      item.name
                    )}
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
          <Button type="submit" disabled={data?.loading}>
            Submit
          </Button>
        </form>
      </Group>
    </Flex>
  );
}
