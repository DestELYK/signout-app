import { Flex, Highlight, Text } from "@mantine/core";
import { Tag } from "@prisma/client";
import OutstandingBadge from "../OutstandingBadge";
import TagGroup from "../tags/TagGroup";

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
      <Flex
        direction="row"
        wrap="nowrap"
        align="center"
        justify="space-between"
        gap="sm"
      >
        <Highlight highlight={highlight}>{name}</Highlight>
        <TagGroup tags={tags} categories={["Location"]} />
      </Flex>
      <Flex
        direction="row"
        gap="sm"
        align="center"
        wrap="nowrap"
        justify="space-between"
      >
        <OutstandingBadge out={outstanding} shortForm />
        {tags && tags.length > 0 ? (
          <TagGroup
            tags={tags}
            categories={["Item Type"]}
            badgeProps={{ size: "xs" }}
          />
        ) : (
          <Text size="xs">No tags</Text>
        )}
      </Flex>
    </>
  );
}
