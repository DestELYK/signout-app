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

export interface QRInputFieldProps<T> {
    label?: string;
    description?: string;
    placeholder?: string;
    error?: React.ReactNode;
    loading?: boolean;
    withQRCode?: boolean;
    autoFocus?: boolean;
    disabled?: boolean;
    required?: boolean;
    value?: string;
    icon?: React.ReactNode;
    items?: T[];
    showCreateOption?: boolean;
    rightSection?: React.ReactNode;
    onSelect?: (id: string, value?: T) => boolean | void;
    onClear?: () => void;
    onScan?: (result: ScanResults) => void;
    disableItem?: (value: T) => boolean;
    children?: (value: T, query?: string) => React.ReactNode;
    onChange?: (value: string) => void;
    onFocus?: () => boolean | void;
    onBlur?: () => boolean | void;
}

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
                const selected =
                    value !== "$create" ? items?.find((v) => v.id.toString() === value) : undefined;

                onSelect?.(value, selected) && combobox.closeDropdown();
            }}
            store={combobox}
        >
            <Combobox.Target>
                <Flex w="100%" direction="row" align="start" gap="xs">
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
                            if (onFocus === undefined || onFocus?.()) {
                                combobox.openDropdown();
                            }
                        }}
                        onBlur={() => {
                            console.log("QRInputField onBlur: ", onBlur === undefined);
                            if (onBlur === undefined || onBlur?.()) {
                                combobox.closeDropdown();
                            }
                        }}
                        onChange={(event) => {
                            onChange?.(event.currentTarget.value);

                            if (event.currentTarget.value.length === 0) {
                                combobox.closeDropdown();
                            } else if (document.activeElement === event.currentTarget) {
                                combobox.openDropdown();
                            }
                        }}
                    />
                    {withQRCode && (
                        <QrButton
                            onResult={(result) => {
                                onScan?.(result);
                            }}
                        />
                    )}
                    {rightSection}
                </Flex>
            </Combobox.Target>
            {items && (
                <Combobox.Dropdown mah={300} style={{ overflowY: "auto" }}>
                    {loading ? (
                        <Combobox.Empty>
                            <Center w="100%" h={60}>
                                <Loader />
                            </Center>
                        </Combobox.Empty>
                    ) : items.length > 0 ? (
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
