import { Flex, Highlight, Text, Title } from "@mantine/core";
import { Tag } from "@prisma/client";
import { IconArrowRight } from "@tabler/icons-react";
import { formatFullName } from "~/utils/utils";
import TagGroup from "../tags/TagGroup";

export interface PersonListViewProps {
  id: number;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  tags: Tag[];
  outstandingLoans: number;
  query?: string;
  qrCode?: string;
}

export default function PersonListView({
  id,
  firstName,
  lastName,
  nickname,
  tags,
  outstandingLoans,
  query,
  qrCode,
}: PersonListViewProps) {
  const fullName = formatFullName({
    firstName: firstName,
    lastName: lastName,
    nickname: nickname,
  });

  return (
    <Flex direction="row" align="center" justify="space-between">
      <Flex w="100%" direction="column" mr="lg">
        <Title order={4}>{`#${id}`}</Title>
        <Flex
          direction="row"
          align="center"
          wrap="nowrap"
          justify="space-between"
        >
          <Highlight
            highlight={qrCode ? fullName : query ? query.split(" ") : ""}
            component={Title}
            order={5}
          >{`${fullName}`}</Highlight>
          <TagGroup tags={tags} categories={["Person Role"]} />
        </Flex>
        <Text size="xs">{outstandingLoans} loans currently out</Text>
      </Flex>
      <IconArrowRight />
    </Flex>
  );
}
