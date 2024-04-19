import { Badge, Card, Flex, Group, Stack, Text, Title } from "@mantine/core";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";

export interface ItemListViewProps {
  id: number;
  name: string;
  description: string;
  tags: { name: string; color: string; category: string }[];
  isOut?: boolean;
  loanCount?: number;
  lastSeen?: Date;
  lastPerson?: {
    firstName: string;
    lastName: string;
    nickname?: string | null;
  };
  active?: boolean;
  onClick?: () => void;
}

export default function ItemListView({
  id,
  name,
  description,
  tags,
  isOut,
  loanCount,
  lastSeen,
  lastPerson,
  active,
  onClick,
}: ItemListViewProps) {
  const itemTypes = tags.filter((t) => t.category === "Item Type");

  const itemStatus = tags.filter((t) => t.category === "Item Status");

  return (
    <Card
      withBorder
      shadow="sm"
      radius="sm"
      p="lg"
      mb="xs"
      mih={100}
      w="100%"
      onClick={onClick}
      style={{
        cursor: "pointer",
      }}
      {...(active && {
        bg: "blue",
        c: "white",
      })}
    >
      <Card.Section withBorder inheritPadding px="xs" pb="xs">
        <Group align="center" justify="space-between" gap={0}>
          <Stack gap={0}>
            <Title order={5} fw="bold" lineClamp={1} ta="center">
              {name}
            </Title>
            <Flex direction="row" justify="space-between">
              {itemTypes.map((tag) => (
                <Badge key={tag.name} size="sm" color={tag.color} autoContrast>
                  {tag.name}
                </Badge>
              ))}
            </Flex>
          </Stack>
          <Group align="center" justify="end">
            {itemStatus.map((tag) => (
              <Badge key={tag.name} size="sm" color={tag.color} autoContrast>
                {tag.name}
              </Badge>
            ))}
            {loanCount && loanCount > 0 && (
              <Badge size="sm" color="grape" autoContrast>
                {loanCount} Loan{loanCount > 0 ? "s" : ""}
              </Badge>
            )}
            <Badge color={isOut ? "red" : "green"} size="md" autoContrast>
              {isOut ? "Out" : "In"}
            </Badge>
          </Group>
        </Group>
      </Card.Section>
      <Text size="sm" my="sm">{description || "No description"}</Text>
      <Card.Section withBorder>
        <Text ta="center" size="sm">
          Last Seen {lastPerson ? "By: " : "On: "}
          {lastPerson && (
            <Text inherit span fw="bold">
              {formatFullName(lastPerson)}
            </Text>
          )}{" "}
          on{" "}
          {formatDate(lastSeen || new Date(), {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}{" "}
          ({dateDiff(lastSeen || new Date())})
        </Text>
      </Card.Section>
    </Card>
  );
}
