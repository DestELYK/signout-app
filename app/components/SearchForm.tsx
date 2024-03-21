import {
  ActionIcon,
  Box,
  Button,
  CloseButton,
  Combobox,
  Flex,
  Loader,
  Text,
  TextInput,
  useCombobox
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import QrButton from "./QrButton";
import { ScanResults } from "./Scanner";

interface SearchFormValues {
  qrCode: string;
  name: string;
}

enum ERRORS {
  BOTH_EMPTY = "Both inputs cannot be empty",
  INVALID_QRCODE = "Invalid QR Code",
  INVALID_CHARACTERS = "Invalid characters used in name",
  NOT_FOUND = "Not found",
  EXISTS = "Item already exists",
}

export default function SearchForm<T>({
  mapItems,
  formData,
  onComboboxSearch,
  onLoading,
  onSubmit,
  onCreateButton,
  ...props
}: {
  mapItems: (value: string, item: T) => JSX.Element;
  formData?: {
    placeholder?: {
      qrCode: string;
      name: string;
    };
    label?: {
      qrCode: string;
      name: string;
    };
  };
  onComboboxSearch?: (value: string) => Promise<Map<string, T>>;
  onLoading?: (loading: boolean) => void;
  onSubmit?: (item: SearchFormValues, result?: T) => void;
  onCreateButton?: () => void;
  props?: React.FormHTMLAttributes<HTMLFormElement>;
}) {
  const form = useForm<SearchFormValues>({
    clearInputErrorOnChange: true,
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
  const [comboItems, setComboItems] = useState<Map<string, T>>(new Map());
  const [loading, setLoading] = useState(false);

  function updateLoading(loading: boolean) {
    setLoading(loading);
    onLoading?.(loading);
  }

  return (
    <form
      {...props.props}
      onSubmit={form.onSubmit((item) => {
        form.reset();
        onSubmit?.(item);
      })}
    >
      <Flex align="start" w="100%">
        <TextInput
          w="100%"
          placeholder="QR Code"
          size="sm"
          rightSection={
            <CloseButton
              aria-label="Clear input"
              onClick={() => {
                form.clearErrors();
                form.setFieldValue("qrCode", "");
                nameCombobox.closeDropdown();
              }}
              style={{
                display: form.isDirty("qrCode") ? undefined : "none",
              }}
            />
          }
          {...form.getInputProps("qrCode")}
        />
        <Box style={{ verticalAlign: "top" }}>
          <QrButton
            onResult={(result: ScanResults) => {
              form.setFieldValue("qrCode", result.data);
            }}
          />
        </Box>
      </Flex>
      <Combobox
        onOptionSubmit={(value) => {
          form.setFieldValue("name", value);
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
                <CloseButton
                  aria-label="Clear input"
                  onClick={() => {
                    form.setFieldValue("name", "");
                    nameCombobox.closeDropdown();
                  }}
                  style={{
                    display: form.isDirty("name") ? undefined : "none",
                  }}
                />
              }
              {...form.getInputProps("name")}
              onChange={(event) => {
                form.getInputProps("name").onChange(event);

                const name = event.currentTarget.value;

                if (name.length === 0) {
                  setComboItems(new Map());

                  console.log("Closing name combobox");
                } else {
                  updateLoading(true);
                  nameCombobox.openDropdown();

                  onComboboxSearch?.(name).then((result) => {
                    updateLoading(false);
                    setComboItems(result);
                  });
                }
              }}
            />
            <ActionIcon
              mt="sm"
              size="input-sm"
              style={{ verticalAlign: "top" }}
              type="submit"
              disabled={loading}
            >
              <IconPlus />
            </ActionIcon>
          </Flex>
        </Combobox.Target>
        <Combobox.Dropdown mah={200} style={{ overflowY: "auto" }}>
          <Button
            w="100%"
            size="xs"
            disabled={loading}
            hidden={!onCreateButton}
            onClick={() => {
              nameCombobox.closeDropdown();
              onCreateButton?.();
            }}
          >
            Create New Item
          </Button>
          {loading ? (
            <Combobox.Empty>
              <Loader />
            </Combobox.Empty>
          ) : comboItems && comboItems.size > 0 ? (
            <Combobox.Options>
              {Array.from(comboItems.values()).map((item) =>
                mapItems(form.values.name, item)
              )}
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
