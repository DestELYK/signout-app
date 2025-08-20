/**
 * MonthCombobox Component
 *
 * A specialized combobox for selecting months with intelligent behavior
 * for both predefined month lists and month generation.
 *
 *
 * @module MonthCombobox
 *
 * @author Kyle Dunn
 */

import { Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

/**
 * Props for the MonthCombobox component
 */
export interface MonthComboboxProps {
  /** Array of month strings in MM-YYYY format */
  months?: string[];
  /** Currently selected month value */
  value?: string | null;
  /** Callback fired when month selection changes */
  onChange: (month: string) => void;
}

/**
 * A specialized month selection combobox with intelligent month handling
 * Provides formatted month display and automatic current month highlighting
 *
 * @param props - The component props
 * @returns The rendered month combobox component
 */
export default function MonthCombobox({ months = [], value, onChange }: MonthComboboxProps) {
  // Current month for highlighting purposes
  const currentMonth = dayjs().format("MM-YYYY");

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [_value, setValue] = useState<string | null>(value || null);

  // Generate options based on provided months or fallback to current year
  const options =
    months.length > 0
      ? // Use provided months, sorted chronologically
        months
          .sort((a, b) => dayjs(a).unix() - dayjs(b).unix())
          .map((item) => {
            const month = dayjs(item, "MM-YYYY");

            return (
              <Combobox.Option
                value={item}
                key={item}
                disabled={month.format("MM-YYYY") === value}
                {...(month.format("MM-YYYY") === currentMonth && { c: "blue" })}
              >
                {month.format("MMM YYYY")}
              </Combobox.Option>
            );
          })
      : // Fallback: generate all 12 months for current year
        Array(12)
          .fill(0)
          .map((_, index) => {
            const month = dayjs().set("month", index);

            return (
              <Combobox.Option
                value={month.format("MM-YYYY")}
                key={month.format("MM-YYYY")}
                disabled={month.format("MM-YYYY") === value}
                {...(month.format("MM-YYYY") === currentMonth && { c: "blue" })}
              >
                {month.format("MMM YYYY")}
              </Combobox.Option>
            );
          });

  // Sync internal state with external value changes
  useEffect(() => {
    setValue(value ?? null);
  }, [value]);

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        setValue(val);
        combobox.closeDropdown();

        onChange(val);
      }}
    >
      <Combobox.Target>
        {/* Compact button-style input with fixed width */}
        <InputBase
          w={120}
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
        >
          {/* Display formatted month or placeholder */}
          {dayjs(value, "MM-YYYY").format("MMM YYYY") || (
            <Input.Placeholder>Pick value</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
