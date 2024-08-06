import {
    Center,
    CheckIcon,
    Combobox,
    Group,
    Loader,
    Modal,
    Pill,
    PillsInput,
    useCombobox,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Tag } from "@prisma/client";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { loader } from "~/routes/tags";
import { PostTagFormData } from "~/utils/types.server";
import { filterTags } from "~/utils/utils";
import TagForm from "../forms/TagForm";

export type OnTagSubmit = (values: PostTagFormData) => void;
export type OnTagSearch = (value: string, category: string) => void;

export type TagComboboxProps = {
    onTagSearch?: OnTagSearch;
    onTagsChange?: (value: Tag[], error?: string) => void;
    fieldInfo?: {
        label?: string;
        description?: string;
        placeholder?: string;
        create?: string;
    };
    category: string;
    unstyled?: boolean;
    autoFocus?: boolean;
    limit?: number;
    error?: string;
    value?: Tag[];
    disabled?: boolean;
    required?: boolean;
};

export default function TagCombobox({
    onTagSearch,
    onTagsChange,
    fieldInfo = {
        label: "Tags",
        placeholder: "Search for tag...",
        create: "New Item",
    },
    category,
    unstyled,
    autoFocus,
    limit = 5,
    error,
    value,
    disabled,

    required,
}: TagComboboxProps) {
    const [tags, setTags] = useState<Tag[]>(value || []);
    const [search, setSearch] = useState("");

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
        onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
    });

    const [opened, { open, close }] = useDisclosure(false);

    const searchTagsFetcher = useTypedFetcher<typeof loader>();

    const loading = searchTagsFetcher.state == "loading";

    const data =
        searchTagsFetcher.data && searchTagsFetcher.data.tags
            ? filterTags(searchTagsFetcher.data.tags)
            : [];

    const handleValueRemove = (val: string) => {
        const newTags = tags.filter((t) => t.id.toString() !== val);
        setTags(newTags);
        onTagsChange?.(newTags);
    };

    const handleValueSelect = (val: string) => {
        if (tags.find((t) => t.id.toString() === val)) {
            handleValueRemove(val);
        } else if (tags.length < limit) {
            const tag = data.find((t) => t.id.toString() === val);
            if (tag) {
                const newTags = [...tags, tag];
                setTags(newTags);
                onTagsChange?.(newTags);

                setSearch("");
            }
        } else {
            error = `Went over limit of ${limit}`;
            onTagsChange?.(tags, error);
        }
    };

    const values = filterTags(tags).map((t) => (
        <Pill key={t.id} withRemoveButton onRemove={() => handleValueRemove(t.id.toString())}>
            {t.name}
        </Pill>
    ));

    const options = data
        .filter((t) => t.name.toLowerCase().includes(search.trim().toLowerCase()))
        .map((t) => (
            <Combobox.Option
                value={t.id.toString()}
                key={t.id.toString()}
                active={tags.find((v) => v.id == t.id) != undefined}
                disabled={!tags.find((v) => v.id == t.id) && tags.length >= limit}
            >
                <Group gap="sm">
                    {tags.find((v) => v.id == t.id) ? <CheckIcon size={12} /> : null}
                    <span>{t.name}</span>
                </Group>
            </Combobox.Option>
        ));

    useEffect(() => {
        setTags(value || []);
    }, [value]);

    useEffect(() => {
        updateSearch("");
    }, []);

    function updateTags(tags: Tag[]) {
        console.log(tags);
        setTags(tags);
        onTagsChange?.(tags);
    }

    function updateSearch(value: string) {
        setSearch(value);

        onTagSearch?.(value, category);
        searchTagsFetcher.load(`/tags?category=${category}&q=${value}`);
    }

    return (
        <>
            <Modal opened={opened} onClose={close} centered title="Create New Tag">
                <TagForm
                    onResult={(data) => {
                        const tag = data.tag;
                        if (tag) {
                            close();

                            // updates the tags with the new tag
                            setTags((tags) => {
                                const newTags = [...tags, tag];

                                onTagsChange?.(newTags);

                                return newTags;
                            });
                            updateSearch("");
                        }
                    }}
                    initialValues={{
                        name: search,
                        category: category,
                        color: "#000000",
                        priority: 0,
                        hidden: false,
                    }}
                    lockCategory
                />
            </Modal>
            <Combobox
                disabled={disabled}
                store={combobox}
                onOptionSubmit={(value) => {
                    if (value === "$create") {
                        open();
                    } else {
                        updateSearch("");
                        handleValueSelect(value);
                    }
                }}
            >
                <Combobox.DropdownTarget>
                    <PillsInput
                        autoFocus={autoFocus}
                        label={fieldInfo.label}
                        description={fieldInfo.description}
                        required={required}
                        {...(unstyled && { variant: "unstyled" })}
                        error={error}
                        onClick={() => {
                            combobox.openDropdown();
                        }}
                    >
                        <Pill.Group>
                            {values}

                            <Combobox.EventsTarget>
                                <PillsInput.Field
                                    autoFocus={autoFocus}
                                    placeholder={fieldInfo.placeholder}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === "Backspace" &&
                                            search.length === 0 &&
                                            tags.length > 0
                                        ) {
                                            event.preventDefault();
                                            handleValueRemove(tags[tags.length - 1].id.toString());
                                        }
                                    }}
                                    value={search}
                                    onFocus={() => {
                                        combobox.openDropdown();
                                    }}
                                    onBlur={() => {
                                        combobox.closeDropdown();
                                    }}
                                    onChange={(event) => {
                                        combobox.updateSelectedOptionIndex();
                                        updateSearch(event.currentTarget.value);
                                    }}
                                />
                            </Combobox.EventsTarget>
                        </Pill.Group>
                    </PillsInput>
                </Combobox.DropdownTarget>

                <Combobox.Dropdown mah={200} style={{ overflowY: "auto" }}>
                    <Combobox.Options>
                        {loading ? (
                            <Combobox.Empty>
                                <Center w="100%" h={60}>
                                    <Loader />
                                </Center>
                            </Combobox.Empty>
                        ) : options.length > 0 ? (
                            options
                        ) : (
                            <Combobox.Empty>
                                Nothing found
                                <Combobox.Option
                                    mt="sm"
                                    value="$create"
                                    variant="subtle"
                                    onClick={() => {
                                        combobox.closeDropdown();
                                    }}
                                >
                                    <Group justify="center">
                                        <IconPlus />
                                        {`Create ${fieldInfo.create || search}...`}
                                    </Group>
                                </Combobox.Option>
                            </Combobox.Empty>
                        )}
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </>
    );
}
