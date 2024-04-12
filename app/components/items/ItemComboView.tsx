import { Badge, Group, Highlight, Text } from "@mantine/core";
import { ItemFindMany } from "~/utils/types.server";

export default function ItemComboView({
  highlight,
  item,
}: {
  highlight: string;
  item: ItemFindMany;
}) {
  return (
    <>
      <Highlight highlight={highlight}>{item.name}</Highlight>
      <Group gap="sm" justify="space-between">
        <Badge
          style={{ justifySelf: "flex-start" }}
          color={item._count.loans > 0 ? "red" : "green"}
        >
          {item._count.loans > 0 ? "Out" : "In"}
        </Badge>
        {item.tags && item.tags.length > 0 ? (
          <Group>
            {item.tags.map((t) => (
              <Badge key={t.name} miw="max-content" ml="auto" color={t.color} autoContrast>
                {t.name}
              </Badge>
            ))}
          </Group>
        ) : (
          <Text size="xs">No tags</Text>
        )}
      </Group>
    </>
  );
}
