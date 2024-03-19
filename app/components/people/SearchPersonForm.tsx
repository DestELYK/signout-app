import {
    ActionIcon,
    Box,
    Button,
    Center,
    Combobox,
    Flex,
    Highlight,
    Loader,
    Text,
    TextInput,
    useCombobox,
  } from "@mantine/core";
  import { useForm } from "@mantine/form";
  import { modals } from "@mantine/modals";
  import { IconPlus } from "@tabler/icons-react";
  import { useState } from "react";
  import { ItemFormValues, PersonFormValues, findItem, findPerson } from "~/lib/test-data";
  import QrButton from "../QrButton";
import { CreatePersonForm } from "./CreatePersonForm";
  
  enum ERRORS {
    BOTH_EMPTY = "Both inputs cannot be empty",
    INVALID_QRCODE = "Invalid QR Code",
    INVALID_CHARACTERS = "Invalid characters used in name",
    NOT_FOUND = "Person doesn't exist",
  }
  
  export enum STATUS {
    NONE = 0,
    SEARCHING,
    CREATING,
  }
  
  export default function SearchPersonForm({
    onStatusChanged,
    onPersonFound,
    ...props
  }: {
    onStatusChanged: (status: STATUS) => void;
    onPersonFound: (person: PersonFormValues) => void;
    props?: React.FormHTMLAttributes<HTMLFormElement>;
  }) {
    const personForm = useForm({
      initialValues: {
        qrCode: "",
        name: "",
      },
      validate: {
        qrCode: (value, values) => {
          if (value.length === 0 && values.name.length === 0) {
            return ERRORS.BOTH_EMPTY;
          } else if (values.name.length === 0) {
            if (!/[0-9]/g.test(value)) {
              return ERRORS.INVALID_QRCODE;
            }
          }
        },
        name: (value, values) => {
          if (value.length === 0 && values.qrCode.length === 0) {
            return ERRORS.BOTH_EMPTY;
          } else if (values.qrCode.length === 0) {
            if (!/[A-Z ]+/gi.test(value)) {
              return ERRORS.INVALID_CHARACTERS;
            }
          }
        },
      },
    });
  
    const nameCombobox = useCombobox();
    const [comboItems, setComboItems] = useState<PersonFormValues[]>([]);
    const [comboLoading, setComboLoading] = useState(false);
    const [status, setStatus] = useState(STATUS.NONE);
  
    const openCreatePersonModal = () => {
      // Show prompt for creating a new item
      modals.open({
        title: "Create Person",
        children: <CreatePersonForm />,
      });
    };
  
    function changeStatus(newStatus: STATUS) {
      setStatus(newStatus);
      onStatusChanged?.(newStatus);
    }
  
    function addPerson(person: { qrCode: string; name: string }) {
      console.log(person);
      changeStatus(STATUS.SEARCHING);
      findPerson({ qrCode: person.qrCode, name: person.name }).then((value) => {
        console.log("Found person: %s", value);
        if (!value || value.length === 0) {
          personForm.setErrors({
            qrCode: ERRORS.NOT_FOUND,
            name: ERRORS.NOT_FOUND,
          });
        } else if (value.length == 1) {
          onPersonFound?.(value[0]);
        }
  
        changeStatus(STATUS.NONE);
        personForm.reset();
      });
    }
  
    function createPerson(person: PersonFormValues): Promise<PersonFormValues> {
      return new Promise((resolve) => {
        setTimeout(() => {
          return resolve(person);
        }, 3000);
      });
    }
  
    return (
      <form
        {...props.props}
        onSubmit={personForm.onSubmit((person) => addPerson(person))}
      >
        <Flex align="start" w="100%">
          <TextInput
            w="100%"
            placeholder="QR Code"
            size="sm"
            {...personForm.getInputProps("qrCode")}
          />
          <Box style={{ verticalAlign: "top" }}>
            <QrButton
              onResult={(result) => {
                personForm.setFieldValue("qrCode", result.data);
              }}
            />
          </Box>
        </Flex>
        <Combobox
          onOptionSubmit={(value) => {
            personForm.setFieldValue("name", value);
            nameCombobox.closeDropdown();
          }}
          store={nameCombobox}
        >
          <Combobox.Target>
            <Flex align="start" w="100%">
              <TextInput
                w="100%"
                mt="sm"
                placeholder="Person Name"
                onFocus={() => nameCombobox.openDropdown()}
                onClick={() => nameCombobox.openDropdown()}
                onBlur={() => nameCombobox.closeDropdown()}
                rightSection={
                  comboLoading ? (
                    <Center>
                      <Loader size="sm" />
                    </Center>
                  ) : null
                }
                {...personForm.getInputProps("name")}
                onChange={(event) => {
                  personForm.getInputProps("name").onChange(event);
  
                  const name = event.currentTarget.value;
  
                  if (name.length === 0) {
                    setComboItems([]);
  
                    console.log("Closing name combobox");
                  } else {
                    setComboLoading(true);
                    nameCombobox.openDropdown();
  
                    console.log("Searching for person %s", name);
  
                    findPerson({ name: name })
                      .then((value) => {
                        setComboItems(value);
                      })
                      .catch((e) => {
                        console.error("Failed to find person", e);
                      })
                      .finally(() => {
                        setComboLoading(false);
                      });
                  }
                }}
              />
              <ActionIcon
                mt="sm"
                size="input-sm"
                style={{ verticalAlign: "top" }}
                type="submit"
                disabled={status !== STATUS.NONE}
              >
                <IconPlus />
              </ActionIcon>
            </Flex>
          </Combobox.Target>
          <Combobox.Dropdown mah={200} style={{ overflowY: "auto" }}>
            <Button
              w="100%"
              size="xs"
              disabled={comboLoading}
              onClick={() => {
                nameCombobox.closeDropdown();
                openCreatePersonModal();
              }}
            >
              Create New Person
            </Button>
            {comboLoading ? (
              <Combobox.Empty>
                <Loader />
              </Combobox.Empty>
            ) : comboItems && comboItems.length > 0 ? (
              <Combobox.Options>
                {comboItems.map((person) => (
                  <Combobox.Option value={`${person.firstName} ${person.lastName}`} key={person.id}>
                    <Highlight highlight={personForm.values.name}>
                      {`${person.firstName} ${person.lastName}`}
                    </Highlight>
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            ) : (
              <Combobox.Empty>
                <Text>No people found</Text>
              </Combobox.Empty>
            )}
          </Combobox.Dropdown>
        </Combobox>
      </form>
    );
  }
  