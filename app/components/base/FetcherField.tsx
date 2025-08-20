/**
 * FetcherField Component
 *
 * A field component that combines QRInputField with
 * server-side data fetching capabilities and modal creation forms.
 * Provides CRUD functionality with search, create, and select.
 *
 *
 * @module FetcherField
 *
 * @author Kyle Dunn
 */

import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { TypedFetcherWithComponents, UseDataFunctionReturn } from "remix-typedjson";
import QRInputField, { QRInputFieldProps } from "./QRInputField";

/**
 * Props for the FetcherField component
 * @template T - The item data type (must have id property)
 * @template F - The fetcher response type
 */
export interface FetcherFieldProps<T, F> {
  /** Title for the create modal */
  createTitle?: string;
  /** Remix fetcher instance for server requests */
  fetcher?: TypedFetcherWithComponents<F>;
  /** API endpoint path for fetching data */
  fetchPath?: string;
  /** Additional query parameters for fetch requests */
  additionalParams?: Record<string, string>;
  /** Function to transform fetcher response to items array */
  onFetched?: (data: UseDataFunctionReturn<F> | null) => T[];
  /** Render function for create form modal content */
  handleCreateForm?: (close: (clearItems?: boolean) => void) => React.ReactNode;
}

/**
 * A field component with server-side fetching and modal creation
 * Extends QRInputField with data fetching and CRUD capabilities
 *
 * @template T - The item data type
 * @template F - The fetcher response type
 * @param props - Combined props from FetcherFieldProps and QRInputFieldProps
 * @returns The rendered fetcher field component
 */
export default function FetcherField<T extends { id: number }, F>({
  createTitle,
  label,
  description,
  placeholder,
  error,
  withQRCode = true,
  autoFocus = false,
  disabled,
  required,
  icon,
  value,
  fetcher,
  fetchPath,
  additionalParams,
  rightSection,
  onFetched,
  handleCreateForm,
  onChange: onChanged,
  onScan,
  onBlur,
  onFocus,
  onSelect,
  onClear,
  disableItem = (item) => false,
  children,
}: FetcherFieldProps<T, F> & Omit<QRInputFieldProps<T>, "showCreateOption" | "loading" | "items">) {
  const [opened, { open, close }] = useDisclosure(false);
  const [items, setItems] = useState<T[]>([]);

  const loading = fetcher?.state === "loading";

  const handleSearch = (value?: string) => {
    if (value === undefined) {
      return;
    }

    const searchParams = new URLSearchParams({ ...additionalParams });
    if (value.length > 0) {
      searchParams.set("q", value);
      fetcher?.load(`${fetchPath}?${searchParams.toString()}`);
    } else {
      fetcher?.load("");
      setItems([]);
    }
  };

  useEffect(() => {
    if (fetcher && fetcher.state === "idle" && fetcher.data) {
      console.log("Fetched data: ", fetcher.data);
      setItems(onFetched?.(fetcher.data) ?? []);
    }
  }, [fetcher?.state, fetcher?.data]);

  useEffect(() => {
    if (value) {
      console.log("Value changed: ", value);
      setItems([]);
    }
  }, [value]);

  return (
    <>
      <Modal opened={opened} onClose={close} title={createTitle}>
        {handleCreateForm?.((clearItems = true) => {
          if (clearItems) {
            setItems([]);
          }

          close();
        })}
      </Modal>
      <QRInputField
        label={label}
        description={description}
        placeholder={placeholder}
        error={error}
        loading={loading}
        withQRCode={withQRCode}
        autoFocus={autoFocus}
        disabled={disabled}
        required={required}
        onScan={(result) => {
          if (result.data) {
            fetcher?.load(`${fetchPath}?qrCode=${result.data}`);
          }

          onScan?.(result);
        }}
        onBlur={() => {
          if (onBlur === undefined || onBlur?.()) {
            setItems([]);

            return true;
          }
        }}
        onFocus={() => {
          if (onFocus === undefined || onFocus?.()) {
            handleSearch(value);

            return true;
          }
        }}
        value={value}
        icon={icon}
        items={items}
        onClear={() => {
          setItems([]);

          onClear?.();
        }}
        rightSection={rightSection}
        onChange={(value) => {
          handleSearch(value);

          onChanged?.(value);
        }}
        onSelect={(selected, value) => {
          if (selected == "$create") {
            setItems([]);
            open();

            return true;
          } else {
            const result = onSelect?.(selected, value);

            if (!result) {
              setItems([]);
            }

            return result;
          }
        }}
        showCreateOption={true}
        disableItem={disableItem}
        children={children}
      />
    </>
  );
}
