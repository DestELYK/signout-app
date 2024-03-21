import {
    ActionIcon,
    Center,
    Combobox,
    Flex,
    Loader,
    NumberInput,
    Stack,
    Text,
    Title,
    useCombobox,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useFetcher } from "@remix-run/react";
import {
    IconQrcode,
    IconQrcodeOff,
    IconX
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loader } from "~/routes/items";
import Scanner, { State, hasCamera } from "../app/components/Scanner";

// TODO - Add error handling
// TODO - Implement scanner

export function ItemIdCombobox() {
  const items = useFetcher<typeof loader>();

  const combobox = useCombobox();
  const [value, setValue] = useState("");
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    combobox.selectFirstOption();
    hasCamera.then(() => {
      setCameraAvailable(true);
    });
  }, [value]);

  const options = items.data?.map((item) => (
    <Combobox.Option value={item.id.toString()} key={item.id}>
      <Stack>
        <Title order={5}>{item.id.toString()}</Title>
        <Text>{item.name}</Text>
      </Stack>
    </Combobox.Option>
  ));

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        setValue(optionValue);
        combobox.closeDropdown();
      }}
      store={combobox}
    >
      <Stack>
        <Flex direction="row" justify="center" align="flex-end" gap="sm">
          <Combobox.Target>
            <NumberInput
              w="100%"
              size="sm"
              label="Item Id"
              placeholder="Enter item id or select one"
              withAsterisk
              value={value}
              hideControls
              allowDecimal={false}
              allowNegative={false}
              disabled={isScanning}
              min={0}
              onChange={(event) => {
                setValue(event.toString());
                combobox.openDropdown();
                items.load(`/items?id=${event}`);
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => combobox.closeDropdown()}
            />
          </Combobox.Target>
          <ActionIcon
            size="input-sm"
            disabled={!cameraAvailable}
            onClick={() => {
              setIsScanning(!isScanning);
              combobox.closeDropdown();
              combobox.focusTarget();
            }}
            variant="outline"
          >
            {!cameraAvailable ? (
              <IconQrcodeOff size="sm" />
            ) : (
              <IconQrcode size="sm" />
            )}
          </ActionIcon>
        </Flex>

        {isScanning && (
          <Scanner
            startOnLoad
            hideButton
            onResult={(result) => {
              console.log("Found result: %s", result.data);
              setIsScanning(false);
              setValue(result.data);
              combobox.openDropdown();
              items.load(`/items?id=${result.data}`);
            }}
            onStateChanged={(state) => {
              switch (state) {
                case State.Rejected:
                case State.Failed:
                  setIsScanning(false);
                  break;
              }
            }}
            onError={(e) => {
              e &&
                notifications.show({
                  title: "Scan Error",
                  message: e,
                  color: "red",
                  icon: <IconX />,
                });
            }}
          />
        )}
      </Stack>

      <Combobox.Dropdown>
        {items.data ? (
          items.state === "loading" ? (
            <Center w="100%">
              <Loader />
            </Center>
          ) : items.data.length ? (
            <Combobox.Options mah="50dvh" style={{ overflowY: "auto" }}>
              {options}
            </Combobox.Options>
          ) : (
            <Combobox.Empty>Nothing found</Combobox.Empty>
          )
        ) : (
          <Combobox.Empty>Nothing found</Combobox.Empty>
        )}
      </Combobox.Dropdown>
    </Combobox>
  );
}
