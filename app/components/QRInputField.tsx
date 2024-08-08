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
import { useEffect, useState } from "react";
import QrButton from "./qrCode/QrButton";

export interface QRInputFieldProps<T> {
    label?: string;
    description?: string;
    placeholder?: string;
    error?: string;
    loading?: boolean;
    withQRCode?: boolean;
    autoFocus?: boolean;
    disabled?: boolean;
    value?: string;
    icon?: React.ReactNode;
    items?: T[];
    onChanged?: (value: string, qrScanned: boolean) => void;
    onSelect?: (value?: T) => void;
    onCreateButton?: () => boolean;
    disableItem?: (value: T) => boolean;
    children?: (value: T) => React.ReactNode;
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
    value: initialValue,
    icon,
    items,
    onChanged,
    onSelect,
    onCreateButton,
    disableItem = (item) => false,
    children,
}: QRInputFieldProps<T>) {
    const [value, setValue] = useState(initialValue ?? "");
    const [scannedQRCode, setScannedQRCode] = useState<string | undefined>();
    const combobox = useCombobox();

    useEffect(() => {
        onChanged?.(value, scannedQRCode !== undefined);
    }, [value, scannedQRCode]);

    useEffect(() => {
        setValue(initialValue ?? "");
    }, [initialValue]);

    console.log(items);

    return (
        <Combobox
            disabled={disabled}
            onOptionSubmit={(value) => {
                if (value != "$create") {
                    const selected = items?.find((v) => v.id.toString() === value);

                    combobox.closeDropdown();

                    onSelect?.(selected);
                }
            }}
            store={combobox}
        >
            <Combobox.Target>
                <Flex w="100%" direction="row" align="center" gap="xs">
                    <TextInput
                        data-autofocus={autoFocus}
                        label={label}
                        description={description}
                        error={error}
                        w="100%"
                        leftSection={icon}
                        rightSection={
                            loading ? (
                                <Loader size="xs" />
                            ) : (
                                value.length > 0 && (
                                    <CloseButton
                                        onClick={() => {
                                            setValue("");
                                            setScannedQRCode(undefined);
                                            onChanged?.("", false);
                                        }}
                                    />
                                )
                            )
                        }
                        placeholder={placeholder}
                        value={value}
                        onFocus={() => {
                            if (scannedQRCode !== undefined) {
                                setValue("");
                                setScannedQRCode(undefined);
                                onChanged?.("", false);
                            }
                        }}
                        onChange={(event) => {
                            setValue(event.currentTarget.value);
                            setScannedQRCode(undefined);
                            onChanged?.(event.currentTarget.value, false);

                            if (event.currentTarget.value.length === 0) {
                                combobox.closeDropdown();
                            } else {
                                combobox.openDropdown();
                            }
                        }}
                    />
                    {withQRCode && (
                        <QrButton
                            onResult={(result) => {
                                setValue(result.data);
                                setScannedQRCode(result.data);
                                onChanged?.(result.data, true);
                            }}
                        />
                    )}
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
