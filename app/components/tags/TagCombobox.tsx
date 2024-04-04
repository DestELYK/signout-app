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
import { GetInputPropsReturnType } from "node_modules/@mantine/form/lib/types";
import { useEffect, useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { loader } from "~/routes/tags";
import CreateTagForm, { TagFormValues } from "./CreateTagForm";

export type OnTagSubmit = (values: TagFormValues) => void;
export type OnTagSearch = (value: string, category: string) => void;

export type TagComboboxProps = {
  onTagSearch?: OnTagSearch;
  onNewTagSubmit?: OnTagSubmit;
  onChange?: (values: Tag[]) => void;
  onItemSelect?: (value: string) => void;
  onItemRemove?: (value: string) => void;
  fieldInfo?: {
    label: string;
    description?: string;
    placeholder: string;
  };
  category: string;
  limit?: number;
  inputProps?: GetInputPropsReturnType;
};

export default function TagCombobox({
  onChange,
  fieldInfo = {
    label: "Tags",
    placeholder: "Search for tag...",
  },
  category,
  limit = 5,
  inputProps,
}: TagComboboxProps) {
  const [value, setValue] = useState<Tag[]>([])
  const [search, setSearch] = useState("");

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [opened, { open, close }] = useDisclosure(false);

  const searchTagsFetcher = useTypedFetcher<typeof loader>();

  const tags = searchTagsFetcher.data || [];

  const handleValueSelect = (val: string) =>
    value.find((t) => t.id.toString() === val)
      ? handleValueRemove(val)
      : setValue([...value, tags.find((t) => t.id.toString() === val)!]);

  const handleValueRemove = (val: string) =>
    setValue(value.filter((t) => t.id.toString() !== val));

  const values = value.map((t) => (
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

  // sends event on value change
  useEffect(() => {
    onChange?.(value);
  }, [value]);

  useEffect(() => {
    searchTagsFetcher.load(`/tags?category=${category}&q=${search}`);
  }, [search])

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
            error={inputProps?.error}
            onClick={() => {
              combobox.openDropdown();
            }}
          >
            <Pill.Group>{values}</Pill.Group>

            <Combobox.EventsTarget>
              <PillsInput.Field
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
                  inputProps?.onFocus();
                  combobox.openDropdown();
                }}
                onBlur={() => {
                  inputProps?.onBlur();
                  combobox.closeDropdown();
                }}
                onChange={(event) => {
                  inputProps?.onChange(event);
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
              />
            </Combobox.EventsTarget>
          </PillsInput>
        </Combobox.DropdownTarget>

        <Combobox.Dropdown mah={200} style={{overflowY: "auto"}}>
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
