import {
  ActionIcon,
  Box,
  CloseButton,
  Combobox,
  Flex,
  Group,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { nameValidator, qrCodeValidator } from "~/utils/validators.client";
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

export type SearchFormProps = {
  children?: React.ReactNode;
  formData?: {
    placeholder?: {
      qrCode?: string;
      name?: string;
    };
    label?: {
      qrCode?: string;
      name?: string;
      createButton?: string;
    };
    description?: {
      qrCode?: string;
      name?: string;
    };
    submitIcon?: JSX.Element;
  };
  showCombobox?: boolean;
  disabled?: boolean;
  qrDisabled?: boolean;
  submitHidden?: boolean;
  onItemSelect?: (value: string) => SearchFormValues;
  onQRCodeChanged?: (value: string) => boolean;
  onNameChanged?: (value: string) => boolean;
  onSubmit?: (value: string) => void;
  onCreateButton?: () => boolean;
  props?: React.FormHTMLAttributes<HTMLFormElement>;
};

export default function SearchForm<T>({
  children,
  formData = {
    label: undefined,
    placeholder: { qrCode: "QRCode", name: "Name" },
    submitIcon: <IconPlus />,
  },
  disabled,
  qrDisabled,
  submitHidden,
  showCombobox = true,
  onQRCodeChanged,
  onNameChanged,
  onSubmit,
  onItemSelect,
  onCreateButton,
  ...props
}: SearchFormProps) {
  const form = useForm<SearchFormValues>({
    clearInputErrorOnChange: true,
    initialValues: {
      qrCode: "",
      name: "",
    },
    validate: {
      qrCode: (value, values) => {
        if (values.name?.length === 0 && values.qrCode?.length === 0) {
          return ERRORS.BOTH_EMPTY;
        } else {
          return qrCodeValidator(value);
        }
      },
      name: (value, values) => {
        if (values.name?.length === 0 && values.qrCode?.length === 0) {
          return ERRORS.BOTH_EMPTY;
        } else {
          return nameValidator(value);
        }
      },
    },
  });
  const combobox = useCombobox();

  const [selectedItem, setSelectedItem] = useState("");

  function reset() {
    form.reset();
    setSelectedItem("");
    combobox.closeDropdown();
  }

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

          const result = onItemSelect?.(value);

          if (result) {
            form.setFieldValue("name", result.name ? result.name : "");
            form.setFieldValue("qrCode", result.qrCode ? result.qrCode : "");
          }

          combobox.closeDropdown();
        }}
        store={combobox}
      >
        {!qrDisabled ? (
          <Combobox.Target>
            <Flex align="start" w="100%">
              <TextInput
                w="100%"
                placeholder={formData.placeholder?.qrCode}
                {...(formData.label && { label: formData.label.qrCode })}
                size="sm"
                description={formData.description?.qrCode}
                onFocus={() => {
                  reset();
                  combobox.openDropdown();
                }}
                onClick={() => {
                  reset();
                  combobox.openDropdown();
                }}
                onBlur={() => {
                  reset();
                  combobox.closeDropdown();
                }}
                rightSection={
                  <CloseButton
                    aria-label="Clear input"
                    onClick={() => {
                      reset();
                    }}
                    style={{
                      display: form.isDirty("qrCode") ? undefined : "none",
                    }}
                  />
                }
                {...form.getInputProps("qrCode")}
                onChange={(event) => {
                  form.getInputProps("qrCode").onChange(event);

                  if (onQRCodeChanged?.(event.currentTarget.value)) {
                    combobox.openDropdown();
                  } else {
                    combobox.closeDropdown();
                  }
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
        ) : null}
        <Combobox.Target>
          <Flex align="start" w="100%">
            <TextInput
              w="100%"
              mt="sm"
              description={formData.description?.name}
              placeholder={formData.placeholder?.name}
              {...(formData.label && { label: formData.label.name })}
              onFocus={() => {
                reset();
                combobox.openDropdown();
              }}
              onClick={() => {
                reset();
                combobox.openDropdown();
              }}
              onBlur={() => {
                reset();
                combobox.closeDropdown();
              }}
              rightSection={
                <CloseButton
                  aria-label="Clear input"
                  onClick={() => {
                    reset();
                  }}
                  style={{
                    display: form.isDirty("name") ? undefined : "none",
                  }}
                />
              }
              {...form.getInputProps("name")}
              onChange={(event) => {
                form.getInputProps("name").onChange(event);

                if (onNameChanged?.(event.currentTarget.value)) {
                  combobox.openDropdown();
                } else {
                  combobox.closeDropdown();
                }
              }}
            />
            {!submitHidden ? (
              <ActionIcon
                mt="sm"
                size="input-sm"
                style={{ verticalAlign: "top" }}
                type="submit"
                disabled={disabled}
              >
                {formData.submitIcon}
              </ActionIcon>
            ) : null}
          </Flex>
        </Combobox.Target>
        {showCombobox ? (
          <Combobox.Dropdown mah={300} style={{ overflowY: "auto" }}>
            {children}
            {onCreateButton ? (
              <Combobox.Option
                value="$create"
                variant="subtle"
                onClick={() => {
                  if (onCreateButton()) combobox.closeDropdown();
                }}
              >
                <Group justify="center">
                  <IconPlus />
                  {formData.label?.createButton || "Create New Item"}
                </Group>
              </Combobox.Option>
            ) : null}
          </Combobox.Dropdown>
        ) : null}
      </Combobox>
    </form>
  );
}
