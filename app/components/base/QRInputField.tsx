/**
 * QRInputField Component
 *
 * A input field component that combines text input functionality
 * with QR code scanning and dropdown selection capabilities. Provides a
 * user experience for data entry with multiple input methods.
 *
 *
 * @module QRInputField
 *
 * @author Kyle Dunn
 */

import {
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
import React from "react";
import QrButton from "../qrCode/QrButton";
import { ScanResults } from "../qrCode/Scanner";

/**
 * Props for the QRInputField component
 * @template T - The data type for dropdown items (must have an id property)
 */
export interface QRInputFieldProps<T> {
  /** Field label text */
  label?: string;
  /** Field description text */
  description?: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Error message or element to display */
  error?: React.ReactNode;
  /** Whether the component is in a loading state */
  loading?: boolean;
  /** Whether to show the QR code scanner button */
  withQRCode?: boolean;
  /** Whether to auto-focus the input on mount */
  autoFocus?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Current input value */
  value?: string;
  /** Icon to display in the left section */
  icon?: React.ReactNode;
  /** Array of items for dropdown selection */
  items?: T[];
  /** Whether to show "Create new" option when no items match */
  showCreateOption?: boolean;
  /** Custom element for the right section */
  rightSection?: React.ReactNode;
  /** Callback fired when an item is selected from dropdown */
  onSelect?: (id: string, value?: T) => boolean | void;
  /** Callback fired when the clear button is clicked */
  onClear?: () => void;
  /** Callback fired when QR code is scanned */
  onScan?: (result: ScanResults) => void;
  /** Function to determine if an item should be disabled */
  disableItem?: (value: T) => boolean;
  /** Custom render function for dropdown items */
  children?: (value: T, query?: string) => React.ReactNode;
  /** Callback fired when input value changes */
  onChange?: (value: string) => void;
  /** Callback fired when input receives focus */
  onFocus?: () => boolean | void;
  /** Callback fired when input loses focus */
  onBlur?: () => boolean | void;
}

/**
 * A sophisticated input field with QR scanning and dropdown selection
 * Combines multiple input methods for enhanced user experience
 *
 * @template T - The data type for dropdown items
 * @param props - The component props
 * @returns The rendered QR input field component
 */
export default function QRInputField<T extends { id: number }>({
  label,
  description,
  placeholder,
  error,
  loading,
  withQRCode = true,
  autoFocus = false,
  disabled,
  required,
  value,
  icon,
  items,
  showCreateOption,
  rightSection,
  onChange,
  onSelect,
  onClear,
  onScan,
  disableItem = (item) => false,
  onBlur,
  onFocus,
  children,
}: QRInputFieldProps<T>) {
  const combobox = useCombobox();

  return (
    <Combobox
      disabled={disabled}
      onOptionSubmit={(value) => {
        // Handle item selection - special case for create option
        const selected =
          value !== "$create" ? items?.find((v) => v.id.toString() === value) : undefined;

        onSelect?.(value, selected) && combobox.closeDropdown();
      }}
      store={combobox}
    >
      <Combobox.Target>
        <Flex w="100%" direction="row" align="start" gap="xs">
          {/* Main text input with dynamic right section */}
          <TextInput
            data-autofocus={autoFocus}
            label={label}
            description={description}
            error={error}
            required={required}
            w="100%"
            leftSection={icon}
            rightSection={
              loading ? (
                <Loader size="xs" />
              ) : (
                // Show clear button when value exists
                value &&
                value.length > 0 && (
                  <CloseButton
                    onClick={() => {
                      onClear?.();
                    }}
                  />
                )
              )
            }
            placeholder={placeholder}
            value={value}
            onFocus={() => {
              // Open dropdown on focus unless custom handler prevents it
              if (onFocus === undefined || onFocus?.()) {
                combobox.openDropdown();
              }
            }}
            onBlur={() => {
              console.log("QRInputField onBlur: ", onBlur === undefined);
              // Close dropdown on blur unless custom handler prevents it
              if (onBlur === undefined || onBlur?.()) {
                combobox.closeDropdown();
              }
            }}
            onChange={(event) => {
              onChange?.(event.currentTarget.value);

              // Auto-manage dropdown visibility based on input state
              if (event.currentTarget.value.length === 0) {
                combobox.closeDropdown();
              } else if (document.activeElement === event.currentTarget) {
                combobox.openDropdown();
              }
            }}
          />
          {/* Optional QR code scanner button */}
          {withQRCode && (
            <QrButton
              onResult={(result) => {
                onScan?.(result);
              }}
            />
          )}
          {/* Custom right section element */}
          {rightSection}
        </Flex>
      </Combobox.Target>
      {/* Dropdown with items or loading/empty states */}
      {items && (
        <Combobox.Dropdown mah={300} style={{ overflowY: "auto" }}>
          {loading ? (
            <Combobox.Empty>
              <Center w="100%" h={60}>
                <Loader />
              </Center>
            </Combobox.Empty>
          ) : items.length > 0 ? (
            // Render available items with custom or default rendering
            items.map((v) => (
              <Combobox.Option
                value={v.id.toString()}
                key={v.id.toString()}
                disabled={disableItem(v)}
              >
                {children ? children(v, value) : <Text>{JSON.stringify(v)}</Text>}
              </Combobox.Option>
            ))
          ) : (
            <>
              <Combobox.Empty>None Found</Combobox.Empty>
              {/* Optional create new item option */}
              {showCreateOption ? (
                <Combobox.Option
                  value="$create"
                  variant="subtle"
                  onClick={() => combobox.closeDropdown()}
                >
                  <Group justify="center">
                    <IconPlus />
                    {`Create ${value || "New Item"}...`}
                  </Group>
                </Combobox.Option>
              ) : null}
            </>
          )}
        </Combobox.Dropdown>
      )}
    </Combobox>
  );
}
