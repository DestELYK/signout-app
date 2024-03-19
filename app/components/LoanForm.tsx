// @ts-nocheck
import { Button, Fieldset, Group, Stack, Text, TextInput } from "@mantine/core";
import ItemTable from "./items/ItemTable";
import { useBlocker } from "@remix-run/react";
import SearchPersonForm from "./people/SearchPersonForm";
import { PersonFormValues } from "~/lib/test-data";
import { useState } from "react";

export default function LoanForm({ loanId }: { loanId?: number }) {
  const [person, setPerson] = useState<PersonFormValues>();

  return (
    <Stack w="100%" h="100%">
      <Fieldset legend="Person">
        {person ? (
          <Text>{`${person.firstName} ${person.lastName}`}</Text>
        ) : (
          <SearchPersonForm
            onPersonFound={(person) => {
              setPerson(person);
            }}
          />
        )}
      </Fieldset>
      <ItemTable />
      <Group justify="end">
        <Button type="submit">Submit</Button>
      </Group>
    </Stack>
  );
}
