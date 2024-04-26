import { Badge, Group, Highlight, Text } from "@mantine/core";
import { Tag } from "@prisma/client";

export interface ItemComboViewProps {
  highlight: string | string[];
  outstanding?: boolean;
  name: string;
  tags: Tag[];
}

export default function ItemComboView({
  highlight,
  outstanding,
  name,
  tags,
}: ItemComboViewProps) {
  return (
    <>
      <Highlight highlight={highlight}>{name}</Highlight>
      <Group gap="sm" justify="space-between">
        <Badge
          style={{ justifySelf: "flex-start" }}
          color={outstanding ? "red" : "green"}
          autoContrast
        >
          {outstanding ? "Out" : "In"}
        </Badge>
        {tags && tags.length > 0 ? (
          <Group>
            {tags.map((t) => (
              <Badge
                key={t.name}
                miw="max-content"
                ml="auto"
                color={t.color}
                autoContrast
              >
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
