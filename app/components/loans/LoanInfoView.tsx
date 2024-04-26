import {
  Badge,
  Card,
  Center,
  Flex,
  Group,
  ScrollArea,
  Text,
  Title,
} from "@mantine/core";
import { PersonWithTags } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";

import { Tag } from "@prisma/client";
import QRCodePreview from "../qrCode/QRCodePreview";

export interface LoanInfoViewProps {
  id: number;
  person: Omit<
    PersonWithTags,
    "_count" | "notes" | "createdDate" | "updatedDate"
  >;
  tags: Tag[];
  createdDate: Date;
  updatedDate: Date;
  notes?: string | null;
  items: number;
  outstandingItems: number;
}

export default function LoanInfoView({
  id,
  person,
  items,
  tags,
  createdDate,
  updatedDate,
  notes,
  outstandingItems,
}: LoanInfoViewProps) {
  return (
    <Flex direction="column" w="100%" h="100%" gap="md">
      {/* Loan Card */}
      <Card withBorder w="100%" h={160} p="sm">
        <Card.Section withBorder inheritPadding py="xs">
          <Flex direction="row" align="center" justify="space-between">
            <Title order={4}>{`Loan #${id}`}</Title>
            <Group>
              {tags.map((t) => (
                <Badge key={t.id} color={t.color} autoContrast>
                  {t.name}
                </Badge>
              ))}
              <Badge
                color={outstandingItems > 0 ? "red" : "green"}
                autoContrast
              >
                {outstandingItems > 0 ? "Out" : "In"}
              </Badge>
            </Group>
          </Flex>
        </Card.Section>
        {notes ? (
          <ScrollArea.Autosize mih={80} type="auto" scrollbars="y">
            <Text>{notes}</Text>
          </ScrollArea.Autosize>
        ) : (
          <Center h="100%">No notes</Center>
        )}
      </Card>

      {/* Person Card */}
      <Card withBorder w="100%" h={130} p="sm">
        <Card.Section withBorder inheritPadding py="xs">
          <Title order={4} ta="center">
            Loaned By
          </Title>
        </Card.Section>
        <Flex h="100%" direction="row" mt="sm" align="center" gap="sm">
          <QRCodePreview qrCode={person.qrCode} scale={2} />
          <Group w="100%" align="center" justify="space-between">
            <Title order={5}>{formatFullName(person)}</Title>
            <Group>
              {person.tags.map((tag) => (
                <Badge key={tag.id} color={tag.color} autoContrast>
                  {tag.name}
                </Badge>
              ))}
            </Group>
          </Group>
        </Flex>
      </Card>

      {/* Outstanding Items */}
      <Group grow>
        <Card withBorder p="sm" h={80}>
          <Flex
            h="100%"
            direction="column"
            align="center"
            gap={0}
            justify="space-between"
          >
            <Text size="32px" ta="center">
              {outstandingItems}
            </Text>
            <Text size="sm" ta="center">
              Outstanding Items
            </Text>
          </Flex>
        </Card>

        {/* Total Items */}
        <Card withBorder p="sm" h={80}>
          <Flex
            h="100%"
            direction="column"
            align="center"
            gap={0}
            justify="space-between"
          >
            <Text size="32px" ta="center">
              {items}
            </Text>
            <Text size="sm" ta="center">
              Total Items
            </Text>
          </Flex>
        </Card>
      </Group>

      {/* Created Date */}
      <Group grow>
        <Card withBorder p="sm" h={120}>
          <Flex
            h="100%"
            direction="column"
            align="center"
            gap={0}
            justify="space-between"
          >
            <Text size="32px" ta="center">
              {dateDiff(createdDate, true)}
            </Text>
            <Text size="sm" ta="center" fw="bold">
              Since Creation
            </Text>
            <Text size="xs" ta="center">
              {formatDate(createdDate)}
            </Text>
          </Flex>
        </Card>

        {/* Updated Date */}
        <Card withBorder p="sm" h={120}>
          <Flex
            h="100%"
            direction="column"
            align="center"
            gap={0}
            justify="space-between"
          >
            <Text size="32px" ta="center">
              {dateDiff(updatedDate, true)}
            </Text>
            <Text size="sm" ta="center" fw="bold">
              Since Updated
            </Text>
            <Text size="xs" ta="center">
              {formatDate(updatedDate)}
            </Text>
          </Flex>
        </Card>
      </Group>
    </Flex>
  );
}
