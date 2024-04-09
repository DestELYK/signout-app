import { ActionIcon, Badge, Group, Table } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
// @ts-ignore
import { QRCode } from "react-qr-code";
import { ItemFindMany } from "~/utils/types.server";


export default function ItemTable({
  items,
  loading,
  showDelete = true,
  onRemoveItem,
}: {
  items: ItemFindMany[];
  loading?: boolean;
  showDelete?: boolean;
  onRemoveItem?: (item: ItemFindMany, index: number) => void;
}) {
  const rows = items.map((item, index) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        {item.qrCode ? (
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
        ) : null}
      </Table.Td>
      <Table.Td>
        {item.name}
        <Group justify="space-around">
          {item.tags
            ? item.tags.map((t) => (
                <Badge key={t.name} size="xs" color={t.color}>
                  {t.name}
                </Badge>
              ))
            : null}
        </Group>
      </Table.Td>
      {showDelete ? (
        <Table.Td>
          <ActionIcon
            size="input-sm"
            color="red"
            onClick={() => onRemoveItem?.(item, index)}
            disabled={loading}
          >
            <IconTrash />
          </ActionIcon>
        </Table.Td>
      ) : null}
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer
      minWidth="100%"
      style={{ height: "calc(100dvh - 36rem)" }}
    >
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
            <Table.Tr key={0}>
              <Table.Td colSpan={3} align="center">
                No items
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
