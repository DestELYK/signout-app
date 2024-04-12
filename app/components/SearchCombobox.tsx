import {
  Box,
  CloseButton,
  Combobox,
  Flex,
  Group,
  Text,
  TextInput,
  useCombobox
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import QrButton from "./QrButton";
import { ScanResults } from "./Scanner";

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
    submitIcon?: JSX.Element;
  };
  showCombobox?: boolean;
  disabled?: boolean;
  qrDisabled?: boolean;
  items: T[];
  value: SearchFormValues;
  autoFocus?: boolean;
  errors?: { name?: string; qrCode?: string };
  onQRCodeChanged?: (value: string) => boolean;
  onNameChanged?: (value: string) => boolean;
  onSubmit?: (value?: T) => void;
  onCreateButton?: () => boolean;
  disableItem?: (value: T) => boolean;
}

export default function SearchCombobox<T extends { id: number;}>({
  children,
  formData = {
    label: undefined,
    placeholder: { qrCode: "QRCode", name: "Name" },
    submitIcon: <IconPlus />,
  },
  disabled,
  qrDisabled,
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
  const [search, setSearch] = useState<SearchFormValues>({
    name: "",
    qrCode: "",
  });

  const combobox = useCombobox();

  const qrCodeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("Search updated with value: ", value)
    setSearch(value);
  }, [value]);

  return (
    <Combobox
      disabled={disabled}
      onOptionSubmit={(value) => {
        if (value != "$create") {
          const selected = items?.find((v) => v.id.toString() === value);

          combobox.closeDropdown();
          qrCodeRef.current?.blur();
          nameRef.current?.blur();

          onSubmit?.(selected);
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
              value={search.qrCode}
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
                    setSearch({ qrCode: "" });

                    onQRCodeChanged?.("");
                  }}
                  style={{
                    display: search.qrCode ? undefined : "none",
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
            value={search.name}
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
                  setSearch({ name: "" });
                  onNameChanged?.("");
                }}
                style={{
                  display: search.name ? undefined : "none",
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
          {items && items.length > 0 ? (
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
                      `Create ${search.name || "New Item"}...`}
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
