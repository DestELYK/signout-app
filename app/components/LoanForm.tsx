import { Box, Button, Divider, Fieldset, Group, LoadingOverlay, Stack, Text, TextInput } from "@mantine/core";
import ItemTable from "./items/ItemTable";
import { useBlocker } from "@remix-run/react";
import SearchPersonForm, { STATUS } from "./people/SearchPersonForm";
import { ItemFormValues, PersonFormValues } from "~/lib/test-data";
import { useState } from "react";
import SearchItemForm from "./items/SearchItemForm";

export default function LoanForm({ loanId }: { loanId?: number }) {
  const [person, setPerson] = useState<PersonFormValues>();
  const [items, setItems] = useState<ItemFormValues[]>([]);

  const [loading, setLoading] = useState(false);

  function addItem(item: ItemFormValues): Promise<ItemFormValues> {
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve(item);
      }, 1000)
    })
  }

  function removeItem(item: ItemFormValues): Promise<ItemFormValues> {
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve(item);
      }, 1000);
    });
  }

  return (
    <Stack w="100%" h="100%">
      <Fieldset legend="Person" disabled={loading}>
        {person ? (
          <Text>{`${person.firstName} ${person.lastName}`}</Text>
        ) : (
          <SearchPersonForm
          onStatusChanged={(status) => {

          }}
            onPersonFound={(person) => {
              setPerson(person);
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
          <ItemTable items={items} loading={loading} onRemoveItem={(item) => removeItem(item)}/>
          <Divider mb="md" />
          <SearchItemForm
            items={items}
            onStatusChanged={(status) => {
              console.debug(`Changed status to ${STATUS[status]}`);
              switch (status) {
                case 0:
                  setLoading(false);
                  break;
                default:
                  setLoading(true);
                  break;
              }
            }}
            onSubmit={(item) => {
              setItems([...items, item]);
            }}
          />
        </Box>
      </Fieldset>
      <Group justify="end">
        <Button type="submit">Submit</Button>
      </Group>
    </Stack>
  );
}
