import { Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export interface MonthComboboxProps {
  months?: string[];
  value?: string | null;
  onChange: (month: string) => void;
}

export default function MonthCombobox({
  months = [],
  value,
  onChange,
}: MonthComboboxProps) {
  const currentMonth = dayjs().format("MM-YYYY");

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [_value, setValue] = useState<string | null>(value || null);

  const options =
    months.length > 0
      ? months
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
      : Array(12)
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
        <InputBase
          w={120}
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
        >
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
