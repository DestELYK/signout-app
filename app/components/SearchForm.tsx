import {
  ActionIcon,
  Box,
  CloseButton,
  Combobox,
  Flex,
  TextInput,
  useCombobox
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import QrButton from "./QrButton";
import { ScanResults } from "./Scanner";

export interface SearchFormValues {
  qrCode?: string;
  name?: string;
}

enum ERRORS {
  BOTH_EMPTY = "Both inputs cannot be empty",
  INVALID_QRCODE = "Invalid QR Code",
  INVALID_CHARACTERS = "Invalid characters used in name",
  NOT_FOUND = "Not found",
  EXISTS = "Item already exists",
}

export default function SearchForm<T>({
  children,
  formData,
  disabled,
  onQRCodeChanged,
  onNameChanged,
  onSubmit,
  onItemSelect,
  onCreateButton,
  ...props
}: {
  children: React.ReactNode;
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
  disabled?: boolean | false;
  onItemSelect: (value: string) => SearchFormValues;
  onQRCodeChanged?: (value: string) => void;
  onNameChanged?: (value: string) => void;
  onSubmit?: (value: string) => void;
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
      // TODO - add check for undefined
      qrCode: (value, values) => {
        if (value!.length === 0 && values.name!.length === 0) {
          return ERRORS.BOTH_EMPTY;
        } else if (values.name!.length === 0) {
          if (!/[0-9]/g.test(value!)) {
            return ERRORS.INVALID_QRCODE;
          }
        }
      },
      name: (value, values) => {
        if (value!.length === 0 && values.qrCode!.length === 0) {
          return ERRORS.BOTH_EMPTY;
        } else if (values.qrCode!.length === 0) {
          if (!/[A-Z ]+/gi.test(value!)) {
            return ERRORS.INVALID_CHARACTERS;
          }
        }
      },
    },
  });
  const combobox = useCombobox();

  const [selectedItem, setSelectedItem] = useState("");

  return (
    <form
      {...props.props}
      onSubmit={form.onSubmit(() => {
        form.reset();
        onSubmit?.(selectedItem);
      })}
    >
      <Combobox
        onOptionSubmit={(value) => {
          setSelectedItem(value);

          const result = onItemSelect(value);
          form.setFieldValue("name", result.name ? result.name : "");
          form.setFieldValue("qrCode", result.qrCode ? result.qrCode : "");

          combobox.closeDropdown();
        }}
        store={combobox}
        onClose={() => {
          if (!selectedItem) {
            form.reset();
          }
        }}
      >
        <Combobox.Target>
          <Flex align="start" w="100%">
            <TextInput
              w="100%"
              placeholder="QR Code"
              size="sm"
              onFocus={() => {
                form.reset();
                setSelectedItem("");
                combobox.openDropdown();
              }}
              onClick={() => {
                form.reset();
                setSelectedItem("");
                combobox.openDropdown();
              }}
              onBlur={() => {
                combobox.closeDropdown();
              }}
              rightSection={
                <CloseButton
                  aria-label="Clear input"
                  onClick={() => {
                    form.clearErrors();
                    form.setFieldValue("qrCode", "");
                    combobox.closeDropdown();
                  }}
                  style={{
                    display: form.isDirty("qrCode") ? undefined : "none",
                  }}
                />
              }
              {...form.getInputProps("qrCode")}
              onChange={(event) => {
                form.getInputProps("qrCode").onChange(event);

                onQRCodeChanged?.(event.currentTarget.value);
              }}
            />
            <Box style={{ verticalAlign: "top" }}>
              <QrButton
                onResult={(result: ScanResults) => {
                  combobox.openDropdown();

                  form.setFieldValue("qrCode", result.data);

                  onQRCodeChanged?.(result.data);
                }}
              />
            </Box>
          </Flex>
        </Combobox.Target>
        <Combobox.Target>
          <Flex align="start" w="100%">
            <TextInput
              w="100%"
              mt="sm"
              placeholder="Item Name"
              onFocus={() => {
                form.reset();
                setSelectedItem("");
                combobox.openDropdown();
              }}
              onClick={() => {
                form.reset();
                setSelectedItem("");
                combobox.openDropdown();
              }}
              onBlur={() => {
                combobox.closeDropdown();
              }}
              rightSection={
                <CloseButton
                  aria-label="Clear input"
                  onClick={() => {
                    form.setFieldValue("name", "");
                    combobox.closeDropdown();
                  }}
                  style={{
                    display: form.isDirty("name") ? undefined : "none",
                  }}
                />
              }
              {...form.getInputProps("name")}
              onChange={(event) => {
                form.getInputProps("name").onChange(event);

                onNameChanged?.(event.currentTarget.value);
              }}
            />
            <ActionIcon
              mt="sm"
              size="input-sm"
              style={{ verticalAlign: "top" }}
              type="submit"
              disabled={disabled}
            >
              <IconPlus />
            </ActionIcon>
          </Flex>
        </Combobox.Target>
        <Combobox.Dropdown mah={200} style={{ overflowY: "auto" }}>
          {children}
        </Combobox.Dropdown>
      </Combobox>
    </form>
  );
}
