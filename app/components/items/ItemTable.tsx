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

export default function ItemTable({
  items,
  loading,
  onRemoveItem,
}: {
  items: ItemFormValues[];
  loading?: boolean | false;
  onRemoveItem: (item: ItemFormValues) => void;
}) {
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
          onClick={() => onRemoveItem(item)}
          disabled={loading}
        >
          <IconTrash />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea h="calc(100% - 8rem)">
      <Table>
        <Table.Thead p={0} m={0}>
          <Table.Tr p={0} m={0}>
            <Table.Th p={0}>QR Code</Table.Th>
            <Table.Th>Item Name</Table.Th>
            <Table.Th w="sm" align="right"></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows && rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={3} align="center">
                No items
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
