import { Badge, Flex, Group, Highlight, Text } from "@mantine/core";
import { Tag } from "@prisma/client";
import { filterTags } from "~/utils/utils";

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
  const locationTag = tags.find((t) => t.category === "Location");

  return (
    <>
      <Flex
        direction="row"
        wrap="nowrap"
        align="center"
        justify="space-between"
        gap="sm"
      >
        <Highlight highlight={highlight}>{name}</Highlight>
        {locationTag && (
          <Badge size="xs" color={locationTag.color} autoContrast>
            {locationTag.name}
          </Badge>
        )}
      </Flex>
      <Flex
        direction="row"
        gap="sm"
        align="center"
        wrap="nowrap"
        justify="space-between"
      >
        <Badge color={outstanding ? "red" : "green"} autoContrast>
          {outstanding ? "Out" : "In"}
        </Badge>
        {tags && tags.length > 0 ? (
          <Group>
            {filterTags(tags, "Item Type").map((t) => (
              <Badge
                size="xs"
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
      </Flex>
    </>
  );
}
