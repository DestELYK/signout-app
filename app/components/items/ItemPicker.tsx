import { ActionIcon, Center, Divider, Flex, Group, Paper, Stack, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { loader as itemsLoader } from "~/routes/items.list";
import { ItemData } from "~/utils/types.server";
import FetcherField from "../base/FetcherField";
import { QRInputFieldProps } from "../base/QRInputField";
import ComboView from "../ComboView";
import ItemForm from "../forms/ItemForm";
import HoverBadge from "../HoverBadge";
import StatusBadge from "../StatusBadge";

export interface ItemPickerProps extends Pick<QRInputFieldProps<ItemData>, "error"> {
    items: ItemData[];
    availableOnly?: boolean;
    onAddItem: (item: ItemData) => void;
    onRemoveItem: (item: ItemData) => void;
}

export default function ItemPicker({
    items,
    error,
    availableOnly,
    onAddItem,
    onRemoveItem,
}: ItemPickerProps) {
    const itemsFetcher = useTypedFetcher<typeof itemsLoader>();
    const [search, setSearch] = useState<string>("");

    const itemElements = items.map((item, index) => (
        <Flex key={item.id} direction="row" align="center" justify="space-between" gap="xs">
            <Group>
                <Paper
                    w={32}
                    h={32}
                    radius={32}
                    withBorder
                    bg="blue"
                    c="white"
                    style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                    {index + 1}
                </Paper>
                <Stack gap={0}>
                    <Text fw="bold" h="100%">
                        {item.name}
                    </Text>
                    <HoverBadge
                        name={item.type?.name ?? "Unknown"}
                        description={item.type?.description}
                        color={item.type === undefined ? "gray" : undefined}
                        badgeProps={{ size: "xs" }}
                    />
                </Stack>
            </Group>
            <ActionIcon
                size="input-sm"
                variant="outline"
                color="red"
                onClick={() => {
                    onRemoveItem?.(item);
                }}
            >
                <IconTrash width={24} height={24} />
            </ActionIcon>
        </Flex>
    ));

    return (
        <Stack>
            {itemElements.length > 0 ? itemElements : <Center>No items</Center>}
            <Divider w="100%" />
            <Flex direction="row" gap={2}>
                <FetcherField
                    disableItem={(item: ItemData) =>
                        items.find((i) => i.id === item.id) !== undefined
                    }
                    {...(availableOnly && {
                        disableItem: (item: ItemData) =>
                            items.find((i) => i.id === item.id) !== undefined ||
                            item.status?.id !== "returned",
                        additionalParams: {
                            sortBy: "status",
                            sortOrder: "asc",
                        },
                    })}
                    fetchPath="/items/list"
                    createTitle="Create New Item"
                    fetcher={itemsFetcher}
                    required
                    value={search}
                    error={error}
                    onFetched={(data) => data?.items ?? []}
                    withQRCode={false}
                    onClear={() => setSearch("")}
                    onBlur={() => setSearch("")}
                    onFocus={() => setSearch("")}
                    onChange={setSearch}
                    onSelect={(id, value) => {
                        if (value) {
                            setSearch("");
                            onAddItem?.(value);
                        }
                    }}
                    handleCreateForm={(close) => {
                        return (
                            <ItemForm
                                initialValues={{
                                    name: search,
                                }}
                                onResult={(result) => {
                                    if (result.data) {
                                        onAddItem(result.data);
                                        close();
                                    }
                                }}
                            />
                        );
                    }}
                >
                    {(value, query) => (
                        <ComboView
                            title={value.name}
                            caption={
                                value.outstandingLoansCount && value.outstandingLoansCount > 0
                                    ? "Outstanding Loans"
                                    : undefined
                            }
                            rightSection={value.status && <StatusBadge status={value.status} />}
                            highlight={query ?? ""}
                        />
                    )}
                </FetcherField>
            </Flex>
        </Stack>
    );
}
