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
import { ItemFormValues, findItem } from "~/lib/test-data";
import QrButton from "../QrButton";
import CreateItemForm from "./CreateItemForm";

enum ERRORS {
  BOTH_EMPTY = "Both inputs cannot be empty",
  INVALID_QRCODE = "Invalid QR Code",
  INVALID_CHARACTERS = "Invalid characters used in name",
  ITEM_EXISTS = "Item already exists in list",
  NOT_FOUND = "Item doesn't exist",
}

export enum STATUS {
  NONE = 0,
  SEARCHING,
  CREATING,
}

interface SearchItemFormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  items: ItemFormValues[];
  onStatusChanged: (status: STATUS) => void;
}

export default function SearchItemForm({
  items,
  onStatusChanged,
  onAddItem,
  ...props
}: {
  items: ItemFormValues[];
  onStatusChanged: (status: STATUS) => void;
  onAddItem: (item: ItemFormValues) => void;
  props?: React.FormHTMLAttributes<HTMLFormElement>;
}) {
  const itemForm = useForm({
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
          } else if (items.find((item) => item.qrCode === value)) {
            return ERRORS.ITEM_EXISTS;
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
  const [comboItems, setComboItems] = useState<ItemFormValues[]>([]);
  const [comboLoading, setComboLoading] = useState(false);
  const [status, setStatus] = useState(STATUS.NONE);

  const openCreateItemModal = () => {
    // Show prompt for creating a new item
    modals.open({
      title: "Create Item",
      children: <CreateItemForm />,
    });
  };

  function changeStatus(newStatus: STATUS) {
    setStatus(newStatus);
    onStatusChanged?.(newStatus);
  }

  function addItem(item: { qrCode: string; name: string }) {
    console.log(item);
    changeStatus(STATUS.SEARCHING);
    findItem({ qrCode: item.qrCode, name: item.name }).then((value) => {
      console.log("Found items: %s", value);
      if (!value || value.length === 0) {
        itemForm.setErrors({
          qrCode: ERRORS.NOT_FOUND,
          name: ERRORS.NOT_FOUND,
        });
      } else if (items.find((item) => item.id === value[0].id)) {
        itemForm.setFieldError("qrCode", ERRORS.ITEM_EXISTS);
        itemForm.setFieldError("name", ERRORS.ITEM_EXISTS);
      } else if (value.length == 1) {
        onAddItem?.(value[0]);
      }

      changeStatus(STATUS.NONE);
      itemForm.reset();
    });
  }

  function createItem(item: ItemFormValues): Promise<ItemFormValues> {
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve(item);
      }, 3000);
    });
  }

  return (
    <form
      {...props.props}
      onSubmit={itemForm.onSubmit((item) => addItem(item))}
    >
      <Flex align="start" w="100%">
        <TextInput
          w="100%"
          placeholder="QR Code"
          size="sm"
          {...itemForm.getInputProps("qrCode")}
        />
        <Box style={{ verticalAlign: "top" }}>
          <QrButton
            onResult={(result) => {
              itemForm.setFieldValue("qrCode", result.data);
            }}
          />
        </Box>
      </Flex>
      <Combobox
        onOptionSubmit={(value) => {
          itemForm.setFieldValue("name", value);
          nameCombobox.closeDropdown();
        }}
        store={nameCombobox}
      >
        <Combobox.Target>
          <Flex align="start" w="100%">
            <TextInput
              w="100%"
              mt="sm"
              placeholder="Item Name"
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
              {...itemForm.getInputProps("name")}
              onChange={(event) => {
                itemForm.getInputProps("name").onChange(event);

                const name = event.currentTarget.value;

                if (name.length === 0) {
                  setComboItems([]);

                  console.log("Closing name combobox");
                } else {
                  setComboLoading(true);
                  nameCombobox.openDropdown();

                  console.log("Searching for item %s", name);

                  findItem({ name: name })
                    .then((value) => {
                      setComboItems(value);
                    })
                    .catch((e) => {
                      console.error("Failed to find item", e);
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
              openCreateItemModal();
            }}
          >
            Create New Item
          </Button>
          {comboLoading ? (
            <Combobox.Empty>
              <Loader />
            </Combobox.Empty>
          ) : comboItems && comboItems.length > 0 ? (
            <Combobox.Options>
              {comboItems.map((item) => (
                <Combobox.Option value={item.name!} key={item.id}>
                  <Highlight highlight={itemForm.values.name}>
                    {item.name ? item.name : "Unknown"}
                  </Highlight>
                </Combobox.Option>
              ))}
            </Combobox.Options>
          ) : (
            <Combobox.Empty>
              <Text>No items found</Text>
            </Combobox.Empty>
          )}
        </Combobox.Dropdown>
      </Combobox>
    </form>
  );
}
