import { Flex, Highlight, Text, Title } from "@mantine/core";
import { Tag } from "@prisma/client";
import { IconArrowRight } from "@tabler/icons-react";
import { dateDiff, formatDate } from "~/utils/utils";
import TagGroup from "../tags/TagGroup";

export interface ItemListViewProps {
  id: number;
  name: string;
  description?: string;
  createdDate: Date;
  tags: Tag[];
  qrCode?: string;
  query?: string;
}

export default function ItemListView({
  id,
  name,
  description,
  createdDate,
  tags,
  qrCode,
  query,
}: ItemListViewProps) {
  return (
    <Flex direction="row" align="center" justify="space-between">
      <Flex w="100%" direction="column" mr="lg">
        <Flex
          direction="row"
          align="center"
          wrap="nowrap"
          justify="space-between"
        >
          <Title order={4}>{`#${id}`}</Title>
          <TagGroup tags={tags} categories={["Item Status"]} limit={1} />
        </Flex>
        <Flex
          direction="row"
          align="center"
          wrap="nowrap"
          justify="space-between"
        >
          <Highlight highlight={qrCode ? name : query ? query.split(" ") : ""}>
            {name}
          </Highlight>
          <TagGroup tags={tags} categories={["Location"]} />
        </Flex>
        <Text size="xs" fs="italic" lineClamp={1} mt="xs">
          {description}
        </Text>
        <Text size="xs">
          Added: {formatDate(createdDate)} ({dateDiff(createdDate)})
        </Text>
      </Flex>
      <IconArrowRight />
    </Flex>
  );
}
