import {
    ActionIcon,
    Button,
    Group,
    InputWrapper,
    Paper,
    Stack,
    Title,
    Tooltip,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconArrowBackUp, IconArrowRight } from "@tabler/icons-react";
import { useState } from "react";
import { UseDataFunctionReturn } from "remix-typedjson";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { LoanFormSchema, LoanFormType } from "~/lib/schemas";
import { DataReturn, ItemData, LoanData, PersonData, TagData } from "~/utils/types.server";
import PersonPicker from "../people/PersonPicker";
import TagCombobox from "../tags/TagCombobox";

export type LoanFormProps = {
    id: number;
    initialValues?: {
        person: PersonData;
        items: ItemData[];
        tags: TagData[];
    };
    onSubmit?: (values: LoanFormType) => void;
    onResult?: (data: UseDataFunctionReturn<DataReturn<LoanData>>) => void;
};

export default function LoanForm({ id, initialValues, onSubmit, onResult }: LoanFormProps) {
    const [person, setPerson] = useState<PersonData | undefined>(initialValues?.person);
    const [items, setItems] = useState<ItemData[]>(initialValues?.items ?? []);
    const [tags, setTags] = useState<TagData[]>(initialValues?.tags ?? []);

    const notificationId = "update-loan";

    const fetcher = useFetcherWithErrorHandler<DataReturn<LoanData>>(
        (data) => {
            if (data) {
                notifications.update({
                    id: notificationId,
                    message: `Updated loan successfully`,
                    loading: false,
                    autoClose: 5000,
                    withCloseButton: true,
                });

                // Reset form values
                form.reset();
                setPerson(undefined);
                setItems([]);
                setTags([]);

                onResult?.(data);
            }
        },
        (error) => {
            notifications.update({
                id: notificationId,
                message: `Failed to update loan`,
                color: "red",
                loading: false,
                autoClose: 5000,
                withCloseButton: true,
            });
        }
    );

    const form = useForm<Partial<LoanFormType>>({
        initialValues: {
            person: { id: person?.id ?? -1 },
            tags: tags,
        },
        validateInputOnChange: true,
        validate: zodResolver(LoanFormSchema.pick({ person: true, tags: true })),
    });

    return (
        <form style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Stack h="100%">
                <Title order={4}>Person</Title>
                <Paper withBorder p="xs">
                    <InputWrapper error={form.errors.person}>
                        <PersonPicker
                            promptOutstanding
                            value={person}
                            error={form.errors.personId}
                            onChange={(person) => {
                                setPerson(person);
                                form.setFieldValue("person", { id: person?.id ?? -1 });
                            }}
                        />
                    </InputWrapper>
                </Paper>
                {/* <Title order={4}>Items</Title>
                <Paper withBorder p="xs">
                    <InputWrapper error={form.errors.items}>
                        <ItemPicker
                            items={items}
                            error={form.errors.itemIds}
                            availableOnly
                            onAddItem={(item) => {
                                setItems([...items, item]);
                                form.setFieldValue(
                                    "items",
                                    [...items, item].map((i) => ({
                                        loanId: 0,
                                        itemId: i.id,
                                        status: "loaned",
                                        dateLoaned: new Date(),
                                    }))
                                );
                            }}
                            onRemoveItem={(item) => {
                                setItems(items.filter((i) => i.id !== item.id));
                                form.setFieldValue(
                                    "itemIds",
                                    items.filter((i) => i.id !== item.id).map((i) => i.id)
                                );
                            }}
                        />
                    </InputWrapper>
                </Paper> */}
                <TagCombobox
                    value={tags}
                    category=""
                    lockCategory={false}
                    error={form.errors.tagIds as string}
                    onTagsChange={(tags) => {
                        setTags(tags);
                        form.setFieldValue("tags", tags);
                    }}
                />
                <Group mt="auto" justify="end">
                    <Tooltip label="Reset form" position="left">
                        <ActionIcon
                            variant="outline"
                            size="input-sm"
                            color="red"
                            onClick={() => {
                                form.reset();
                            }}
                        >
                            <IconArrowBackUp />
                        </ActionIcon>
                    </Tooltip>
                    <Button
                        disabled={form.isValid() === false}
                        rightSection={<IconArrowRight />}
                        onClick={(event) => {
                            onSubmit?.(form.values as LoanFormType);

                            notifications.show({
                                id: notificationId,
                                message: "Updating loan...",
                                loading: true,
                                autoClose: false,
                                withCloseButton: true,
                            });

                            fetcher.submit(JSON.stringify(form.values), {
                                method: "PATCH",
                                action: `/loans/${id}`,
                                encType: "application/json",
                            });
                        }}
                    >
                        Update Loan
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
