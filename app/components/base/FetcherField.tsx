import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { TypedFetcherWithComponents, UseDataFunctionReturn } from "remix-typedjson";
import QRInputField, { QRInputFieldProps } from "./QRInputField";

export interface FetcherFieldProps<T, F> {
    createTitle?: string;
    fetcher?: TypedFetcherWithComponents<F>;
    fetchPath?: string;
    additionalParams?: Record<string, string>;
    onFetched?: (data: UseDataFunctionReturn<F> | null) => T[];
    handleCreateForm?: (close: (clearItems?: boolean) => void) => React.ReactNode;
}

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
