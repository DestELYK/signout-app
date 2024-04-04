import {
    CheckIcon,
    Combobox,
    Group,
    Pill,
    PillsInput,
    useCombobox,
} from "@mantine/core";
import { Tag } from "@prisma/client";
import { GetInputPropsReturnType } from "node_modules/@mantine/form/lib/types";
import { useEffect, useState } from "react";

export type TagComboboxProps = {
  onTagSearch?: (value: string) => void;
  onChange?: (values: Tag[]) => void;
  fieldInfo?: {
    label: string;
    description?: string;
    placeholder: string 
  };
  limit?: number;
  tags: Tag[];
  inputProps?: GetInputPropsReturnType;
};

export default function TagCombobox({
  onTagSearch,
  onChange,
  fieldInfo = {
    label: "Tags",
    placeholder: "Search for tag..."
  },
  limit = 5,
  tags,
  inputProps,
}: TagComboboxProps) {
  const [value, setValue] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const handleValueSelect = (val: string) =>
    value.find((t) => t.id.toString() === val)
      ? handleValueRemove(val)
      : setValue([...value, tags.find((t) => t.id.toString() === val)!]);

  const handleValueRemove = (val: string) =>
    setValue(value.filter((t) => t.id.toString() !== val));

  const values = value.map((t) => (
    <Pill
      key={t.id}
      color={t.color}
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

  function handleChange(value: string) {
    onTagSearch?.(value);
    setSearch(value);
  }

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(value) => {
        handleChange("");
        handleValueSelect(value);
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
            onTagSearch?.(search);
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
                handleChange(event.currentTarget.value);
              }}
            />
          </Combobox.EventsTarget>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>Nothing found...</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
