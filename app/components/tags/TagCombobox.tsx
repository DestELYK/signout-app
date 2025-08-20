/**
 * TagCombobox Component
 *
 * A combobox component for tag selection and management
 * in the signout system. Provides search, selection, creation, and
 * category filtering capabilities for tags.
 *
 *
 * @module TagCombobox
 *
 * @author Kyle Dunn
 */

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
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { loader } from "~/routes/tags";
import { TagData } from "~/utils/types.server";
import { filterTags } from "~/utils/utils";
import TagForm from "../forms/TagForm";

/**
 * Props for the TagCombobox component
 */
export type TagComboboxProps = {
  /** Callback fired when searching for tags */
  onTagSearch?: (value: string, category: string) => void;
  /** Callback fired when selected tags change */
  onTagsChange?: (value: TagData[], error?: string) => void;
  /** Field configuration for labels and placeholders */
  fieldInfo?: {
    /** Field label text */
    label?: string;
    /** Field description text */
    description?: string;
    /** Placeholder text for input */
    placeholder?: string;
    /** Text for create new tag button */
    create?: string;
  };
  /** Category filter for tags */
  category: string;
  /** Whether to use unstyled appearance */
  unstyled?: boolean;
  /** Whether to lock category selection */
  lockCategory?: boolean;
  /** Whether to auto-focus on mount */
  autoFocus?: boolean;
  /** Maximum number of tags allowed */
  limit?: number;
  /** Error message to display */
  error?: string;
  /** Currently selected tags */
  value?: TagData[];
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
};

/**
 * A sophisticated combobox component for tag selection and management
 * Handles tag search, selection, creation, and category filtering
 *
 * @param props - The component props
 * @returns The rendered tag combobox component
 */
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
  lockCategory = true,
  limit = 5,
  error,
  value,
  disabled,
  required,
}: TagComboboxProps) {
  const [tags, setTags] = useState<TagData[]>(value || []);
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
      ? filterTags(searchTagsFetcher.data.tags ?? [])
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

  function updateTags(tags: TagData[]) {
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
          onResult={(tagData) => {
            const tag = tagData.data;
            if (tag) {
              close();
              const newTags = [...tags, tag];
              // updates the tags with the new tag
              setTags(newTags);
              onTagsChange?.(newTags);
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
          lockCategory={lockCategory}
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
                    if (event.key === "Backspace" && search.length === 0 && tags.length > 0) {
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
