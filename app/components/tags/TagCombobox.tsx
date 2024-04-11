import {
  CheckIcon,
  Combobox,
  Group,
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
import CreateTagForm, { TagFormValues } from "./CreateTagForm";

export type OnTagSubmit = (values: TagFormValues) => void;
export type OnTagSearch = (value: string, category: string) => void;

export type TagComboboxProps = {
  onTagSearch?: OnTagSearch;
  onTagsChange?: (value: Tag[]) => void;
  onTagAdd?: (value: string) => void;
  onTagRemove?: (value: string) => void;
  fieldInfo?: {
    label?: string;
    description?: string;
    placeholder?: string;
  };
  category: string;
  autoFocus?: boolean;
  limit?: number;
  error?: string;
  initialValue?: Tag[];
};

export default function TagCombobox({
  onTagSearch,
  onTagsChange,
  onTagAdd,
  onTagRemove,
  fieldInfo = {
    label: "Tags",
    placeholder: "Search for tag...",
  },
  category,
  autoFocus,
  limit = 5,
  error,
  initialValue = [],
}: TagComboboxProps) {
  const [value, setValue] = useState<Tag[]>(initialValue);
  const [search, setSearch] = useState("");

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [opened, { open, close }] = useDisclosure(false);

  const searchTagsFetcher = useTypedFetcher<typeof loader>();

  const tags = searchTagsFetcher.data || [];

  const handleValueRemove = (val: string) => {
    onTagRemove?.(val);
    setValue(value.filter((t) => t.id.toString() !== val));
  };

  const handleValueSelect = (val: string) => {
    if (value.find((t) => t.id.toString() === val)) {
      handleValueRemove(val);
    } else {
      onTagAdd?.(val);
      setValue([...value, tags.find((t) => t.id.toString() === val)!]);
    }
  };

  const values = value.map((t: Tag) => (
    <Pill
      key={t.id}
      withRemoveButton
      onRemove={() => handleValueRemove(t.id.toString())}
    >
      {t.name}
    </Pill>
  ));

  const options = tags
    ? tags
        .filter((t) =>
          t.name.toLowerCase().includes(search.trim().toLowerCase())
        )
        .map((t) => (
          <Combobox.Option
            value={t.id.toString()}
            key={t.id.toString()}
            active={value.find((v) => v.id == t.id) != undefined}
            disabled={!value.find((v) => v.id == t.id) && value.length >= limit}
          >
            <Group gap="sm">
              {value.find((v) => v.id == t.id) ? <CheckIcon size={12} /> : null}
              <span>{t.name}</span>
            </Group>
          </Combobox.Option>
        ))
    : [];

  useEffect(() => {
    onTagsChange?.(value);
  }, [value]);

  useEffect(() => {
    onTagSearch?.(search, category);
    searchTagsFetcher.load(`/tags?category=${category}&q=${search}`);
  }, [search]);

  return (
    <>
      <Modal opened={opened} onClose={close} centered title="Create New Tag">
        <CreateTagForm
          onSubmitted={(tag) => {
            setValue([...value, tag]);
            close();
          }}
          category={category}
          name={search}
        />
      </Modal>
      <Combobox
        store={combobox}
        onOptionSubmit={(value) => {
          if (value === "$create") {
            open();
          } else {
            setSearch("");
            handleValueSelect(value);
          }
        }}
      >
        <Combobox.DropdownTarget>
          <PillsInput
            label={fieldInfo.label}
            description={fieldInfo.description}
            required
            variant="unstyled"
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
                      value.length > 0
                    ) {
                      event.preventDefault();
                      handleValueRemove(value[value.length - 1].id.toString());
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
                    setSearch(event.currentTarget.value);
                  }}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>

        <Combobox.Dropdown mah={200} style={{ overflowY: "auto" }}>
          <Combobox.Options>
            {options.length > 0 ? (
              options
            ) : (
              <Combobox.Empty>
                Nothing found...
                <Combobox.Option
                  value="$create"
                  variant="subtle"
                  onClick={() => {
                    combobox.closeDropdown();
                  }}
                >
                  <Group justify="center">
                    <IconPlus />
                    Create New Tag
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
