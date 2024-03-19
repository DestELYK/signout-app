import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Combobox,
  Dialog,
  Divider,
  Fieldset,
  Flex,
  Group,
  Highlight,
  Loader,
  LoadingOverlay,
  Modal,
  Overlay,
  ScrollArea,
  Space,
  Stack,
  Table,
  Text,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconLoader, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { setTimeout } from "timers";
import QrButton from "../QrButton";
import { notifications } from "@mantine/notifications";
import { useBlocker } from "@remix-run/react";
// @ts-ignore
import { QRCode } from "react-qr-code";

import classes from "./Mobile.module.css";
import { modals } from "@mantine/modals";
import SerachItemForm, { STATUS } from "./SearchItemForm";
import SearchItemForm from "./SearchItemForm";
import { ItemFormValues } from "~/lib/test-data";

export default function ItemTable() {
  const [items, setItems] = useState<ItemFormValues[]>([]);

  const [addItemVisible, setAddItemVisible] = useState(false);

  const [modifyingItems, setModifyingItems] = useState(false);

  const rows = items.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        {item.qrCode && (
          <div
            style={{
              height: "auto",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <QRCode
              size={32}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={item.qrCode.toString()}
              viewBox={`0 0 32 32`}
            />
          </div>
        )}
      </Table.Td>
      <Table.Td>
        {item.name}
        <Badge size="xs" fullWidth>
          {item.type}
        </Badge>
      </Table.Td>
      <Table.Td>
        <ActionIcon
          size="input-sm"
          color="red"
          onClick={() => {
            setModifyingItems(true);
            removeItem(item).then((value) => {
              setItems(items.filter((i) => i.id !== value.id));
              setModifyingItems(false);
            });
          }}
          disabled={modifyingItems}
        >
          <IconTrash />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  function removeItem(item: ItemFormValues): Promise<ItemFormValues> {
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve(item);
      }, 3000);
    });
  }

  //   function findItem() {
  //     if (itemQrCode.length === 0 && itemName.length === 0) {
  //       setItemQrCodeError("Both values can't be empty");
  //       setItemNameError("Both values can't be empty");

  //       return;
  //     }

  //     setSearchingItem(true);
  //     setTimeout(() => {
  //       setSearchingItem(false);
  //       const foundItems = TEST_ITEMS.filter(
  //         (item) => item.qrCode === itemQrCode || item.name === itemName
  //       );
  //     }, 1000);
  //   }

  //   function removeItem(itemId: number) {
  //     const newItems = items.filter((item, index) => index != itemId);
  //     setItems(newItems);
  //   }

  //   function clearErrors() {
  //     setItemQrCodeError();
  //     setItemNameError();
  //   }

  return (
    <Fieldset legend="Items" disabled={modifyingItems} p="sm" h="100%">
      <Box pos="relative" h="100%">
        <LoadingOverlay
          visible={modifyingItems}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <ScrollArea h="calc(100% - 8rem)" >
          <Table>
            <Table.Thead p={0} m={0}>
              <Table.Tr p={0} m={0}>
                <Table.Th p={0}>QR Code</Table.Th>
                <Table.Th>Item Name</Table.Th>
                <Table.Th w="sm" align="right">
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows && rows.length > 0 ? (
                rows
              ) : !addItemVisible ? (
                <Table.Tr>
                  <Table.Td colSpan={3} align="center">
                    No items
                  </Table.Td>
                </Table.Tr>
              ) : null}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Divider mb="md"/>
          <SearchItemForm
            items={items}
            onStatusChanged={(status) => {
              console.debug(`Changed status to ${STATUS[status]}`);
              switch (status) {
                case 0:
                  setModifyingItems(false);
                  setAddItemVisible(false);
                  break;
                default:
                  setModifyingItems(true);
                  break;
              }
            }}
            onAddItem={(item) => {
              setItems([...items, item]);
              notifications.show({
                message: `Added ${item.name} to the list`,
              });
            }}
          />
      </Box>
    </Fieldset>
  );
}
