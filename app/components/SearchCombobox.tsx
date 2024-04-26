import {
  Box,
  Center,
  CloseButton,
  Combobox,
  Flex,
  Group,
  Loader,
  Text,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import React, { useRef } from "react";
import QrButton from "./qrCode/QrButton";
import { ScanResults } from "./qrCode/Scanner";

export interface SearchFormValues {
  qrCode?: string;
  name?: string;
}

export interface SearchFormProps<T extends { id: number; key?: string }> {
  children: (value: T) => React.ReactNode;
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
  };
  showCombobox?: boolean;
  disabled?: boolean;
  qrDisabled?: boolean;
  loading?: boolean;
  items: T[];
  value: SearchFormValues;
  autoFocus?: boolean;
  errors?: { name?: string; qrCode?: string };
  onQRCodeChanged?: (value: string) => boolean;
  onNameChanged?: (value: string) => boolean;
  onSubmit?: (value?: T) => boolean | undefined;
  onCreateButton?: () => boolean;
  disableItem?: (value: T) => boolean;
}

export default function SearchCombobox<T extends { id: number }>({
  children,
  formData = {
    label: undefined,
    placeholder: { qrCode: "QRCode", name: "Name" },
  },
  disabled,
  qrDisabled,
  loading,
  showCombobox = true,
  items,
  value,
  autoFocus,
  errors,
  onQRCodeChanged,
  onNameChanged,
  onSubmit,
  onCreateButton,
  disableItem = (item) => false,
}: SearchFormProps<T>) {
  const combobox = useCombobox();

  const qrCodeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <Combobox
      disabled={disabled}
      onOptionSubmit={(value) => {
        if (value != "$create") {
          const selected = items?.find((v) => v.id.toString() === value);

          console.log("Selected Item: %s", value);

          if (onSubmit?.(selected)) {
            combobox.closeDropdown();
            qrCodeRef.current?.blur();
            nameRef.current?.blur();
          }
        }
      }}
      store={combobox}
    >
      {!qrDisabled ? (
        <Combobox.Target>
          <Flex align="start" w="100%">
            <TextInput
              ref={qrCodeRef}
              w="100%"
              placeholder={formData.placeholder?.qrCode}
              {...(formData.label && { label: formData.label.qrCode })}
              size="sm"
              description={formData.description?.qrCode}
              value={value.qrCode}
              error={errors?.qrCode}
              onFocus={() => {
                combobox.openDropdown();
              }}
              onClick={() => {
                combobox.openDropdown();
              }}
              onBlur={() => {
                combobox.closeDropdown();
              }}
              rightSection={
                <CloseButton
                  aria-label="Clear input"
                  onClick={() => {
                    onQRCodeChanged?.("");
                  }}
                  style={{
                    display: value.qrCode ? undefined : "none",
                  }}
                />
              }
              onChange={(event) => {
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
            ref={nameRef}
            w="100%"
            mt="sm"
            autoFocus={autoFocus}
            description={formData.description?.name}
            placeholder={formData.placeholder?.name}
            {...(formData.label && { label: formData.label.name })}
            error={errors?.name}
            value={value.name}
            onFocus={(s) => {
              combobox.openDropdown();
            }}
            onClick={() => {
              combobox.openDropdown();
            }}
            onBlur={() => {
              combobox.closeDropdown();
            }}
            rightSection={
              <CloseButton
                aria-label="Clear input"
                onClick={() => {
                  onNameChanged?.("");
                }}
                style={{
                  display: value.name ? undefined : "none",
                }}
              />
            }
            onChange={(event) => {
              if (onNameChanged?.(event.currentTarget.value)) {
                combobox.openDropdown();
              } else {
                combobox.closeDropdown();
              }
            }}
          />
        </Flex>
      </Combobox.Target>
      {showCombobox ? (
        <Combobox.Dropdown mah={300} style={{ overflowY: "auto" }}>
          {loading ? (
            <Combobox.Empty>
              <Center w="100%" h={60}>
                <Loader />
              </Center>
            </Combobox.Empty>
          ) : items && items.length > 0 ? (
            items.map((v) => (
              <Combobox.Option
                value={v.id.toString()}
                key={v.id.toString()}
                disabled={disableItem(v)}
              >
                {children ? children(v) : <Text>{JSON.stringify(v)}</Text>}
              </Combobox.Option>
            ))
          ) : (
            <>
              <Combobox.Empty>None Found</Combobox.Empty>
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
                    {formData.label?.createButton ||
                      `Create ${value.name || "New Item"}...`}
                  </Group>
                </Combobox.Option>
              ) : null}
            </>
          )}
        </Combobox.Dropdown>
      ) : null}
    </Combobox>
  );
}
