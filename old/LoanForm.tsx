// @ts-nocheck
import {
  Badge,
  Button,
  Center,
  Combobox,
  Fieldset,
  Flex,
  Group,
  Loader,
  Switch,
  Text,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Form, useFetcher } from "@remix-run/react";
import { useState } from "react";
import QrButton from "./QrButton";
import { Person, Prisma } from "@prisma/client";

export default function LoanForm({ loanId }: { loanId?: number }) {
  const peopleFetcher = useFetcher<Person | Person[]>();
  const form = useForm({
    initialValues: {
      id: "",
      name: "",
    },
  });

  console.debug(peopleFetcher.data)

  const [searchById, setSearchById] = useState(true);
  const [personId, setPersonId] = useState("");
  const [personSearch, setPersonSearch] = useState

  const personIdCombobox = useCombobox();
  const personNameCombobox = useCombobox();

  function updatePerson(id?: string, name?: string) {
    if (id) {
      personIdCombobox.openDropdown();
      peopleFetcher.load(`/people/${id}`);
    } else {
      peopleFetcher.load(`/people?query=${name}`);
    }
  }

  return (
    <>
      <Fieldset legend="Person">
        <Flex direction="row" gap="sm">

        </Flex>
        {searchById ? (
          <Combobox
            onOptionSubmit={(optionValue) => {
              personIdCombobox.closeDropdown()
              setPersonId(optionValue);
            }}
            store={personIdCombobox}
          >
            <Flex direction="row" gap="sm">
              <Combobox.Target>
                <TextInput
                  required
                  w="100%"
                  placeholder="Id"
                  label="Id"
                  value={personId}
                  onChange={(event) => {
                    setPersonId(event.currentTarget.value);
                    updatePerson(event.currentTarget.value);
                  }}
                />
              </Combobox.Target>
              <QrButton
                onResult={(result) => {
                  console.log("Got result: %s", result.data);
                  setPersonId(result.data);
                  updatePerson(result.data);
                }}
              />
            </Flex>

            <Combobox.Dropdown>
              {peopleFetcher.state === "loading" ? (
                <Center>
                  <Loader />
                </Center>
              ) : peopleFetcher.data ? (
                peopleFetcher.data instanceof Prisma.Person && (
                  <Combobox.Option value={peopleFetcher.data.id}>
                    <Text>{`${peopleFetcher.data.firstName} ${
                      peopleFetcher.data.lastName
                    }${
                      peopleFetcher.data.nickname &&
                      ` (${peopleFetcher.data.nickname})`
                    }`}</Text>
                  </Combobox.Option>
                ) 
              ) : (
                <Combobox.Empty>
                  No results
                  <Button>Create New Person</Button>
                </Combobox.Empty>
              )}
            </Combobox.Dropdown>
          </Combobox>
        ) : (
          <Combobox
            onOptionSubmit={(optionValue) => {

            }}
            store={personNameCombobox}>
              <Combobox.Target>
                <TextInput placeholder="Name" label="Name"></TextInput>
              </Combobox.Target>
              <Combobox.Dropdown>
                  <Combobox.Options>
                    {peopleFetcher.data.map((person) => (
                      <Combobox.Option
                        key={person.id}
                        value={person.id.toString()}
                      >
                        <Text>{`${person.firstName} ${person.lastName}${
                          person.nickname && ` (${person.nickname})`
                        }`}</Text>
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
        )}
        <Switch
          onLabel="Search by Name"
          offLabel="Search by ID"
          defaultChecked
          onChange={(event) => {
            setSearchById(event.currentTarget.checked);
          }}
        />
      </Fieldset>
      <Form action="/loans" method="POST">
        <Group justify="flex-end" mt="md">
          <Button>Create</Button>
        </Group>
        {/* <QRCombobox
          fetcher={peopleFetcher}
          optionsHandler={(item: Person) => {
            <Combobox.Option>
              <Title>{`${item.firstName} ${item.lastName}`}</Title>
              <Text>{item.id}</Text>
            </Combobox.Option>;
          }}
          name="id"
          onChange={(value) => {
            console.log("QR Changed: %s", data);
          }}
        /> */}
      </Form>
    </>
  );
}
