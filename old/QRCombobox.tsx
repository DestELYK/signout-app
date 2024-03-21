import {
    Combobox,
    Flex,
    Stack,
    TextInput,
    useCombobox
} from "@mantine/core";
import { FetcherWithComponents } from "@remix-run/react";
import { ReactNode, useEffect, useState } from "react";
import { hasCamera } from "../app/components/Scanner";

export function QRCombobox<T>({fetcher, optionsHandler, href, name, onChange}: {fetcher: FetcherWithComponents<T>, optionsHandler: (item: T) => ReactNode, href: string, name: string, onChange?: (value: string, data: any) => void}) {
  const combobox = useCombobox();
  const [value, setValue] = useState("");
  const [error, setError] = useState<any>();
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    combobox.selectFirstOption();
    hasCamera.then(() => {
      setCameraAvailable(true);
    });
  }, [value]);

  const options = fetcher.data && fetcher.data instanceof Array ? fetcher.data.map(optionsHandler) : <Combobox.Empty>Invalid data type</Combobox.Empty>;

  function updateValue(value: string) {
    try {
      onChange?.(value, fetcher.data)
    
      setValue(value);
      combobox.openDropdown();
      fetcher.load(`${href}?${name}=${value}`);
    } catch(e) {
      setError(e);
    }
  }

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        setValue(optionValue);
        combobox.closeDropdown();
      }}
      store={combobox}
    >
      <Stack>
        <Flex direction="row" justify="center" align="flex-end">
          <Combobox.Target>
            <TextInput
              w="100%"
              size="sm"
              label="Item Id"
              placeholder="Enter item id or select one"
              withAsterisk
              value={value}
              disabled={isScanning}
              min={0}
              onChange={(event) => {
                updateValue(event.currentTarget.value);
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => combobox.closeDropdown()}
            />
          </Combobox.Target>
          
        </Flex>
      </Stack>

      <Combobox.Dropdown>
        {options}
        {fetcher.data ? (
            <Combobox.Options mah="50dvh" style={{ overflowY: "auto" }}>
              {options}
            </Combobox.Options>
        ) : (
          <Combobox.Empty>Nothing found</Combobox.Empty>
        )}
      </Combobox.Dropdown>
    </Combobox>
  );
}
