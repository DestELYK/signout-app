import { Flex, Highlight, Text, Title } from "@mantine/core";
import { Tag } from "@prisma/client";
import { IconArrowRight } from "@tabler/icons-react";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import { createOutstandingTag } from "../OutstandingBadge";
import TagGroup from "../tags/TagGroup";

export interface LoanListViewProps {
  id: number;
  person: {
    id: number;
    firstName: string;
    lastName: string;
    nickname?: string | null;
    tags: Tag[];
  };
  items: {
    id: number;
    name: string;
    qrCode?: string | null;
  }[];
  tags: Tag[];
  createdDate: Date;
  outstandingLoans: number;
  query?: string;
  qrCode?: string;
}

export default function LoanListView({
  id,
  person,
  items,
  tags,
  createdDate,
  outstandingLoans,
  query,
  qrCode,
}: LoanListViewProps) {
  return (
    <Flex direction="row" align="center" justify="space-between">
      <Flex w="100%" direction="column">
        <Flex
          direction="row"
          align="center"
          wrap="nowrap"
          justify="space-between"
        >
          <Title order={4}>{`#${id}`}</Title>
          <TagGroup
            tags={[
              ...tags,
              createOutstandingTag({ out: outstandingLoans > 0 }),
            ]}
          />
        </Flex>
        <Highlight highlight={query ? query.split(" ") : ""}>{`${formatFullName(
          person
        )}`}</Highlight>
        {items.slice(0, 2).map((i) => (
          <Highlight
            key={i.id}
            size="xs"
            highlight={
              qrCode && i.qrCode === qrCode
                ? i.name
                : query
                ? query.split(" ")
                : ""
            }
          >
            {i.name}
          </Highlight>
        ))}
        {items.length > 2 && (
          <Text fs="italic" size="xs">
            ...and {items.length - 2} other items
          </Text>
        )}
        <Text size="xs" mt="sm">
          Created: {formatDate(createdDate)} ({dateDiff({ date: createdDate })})
        </Text>
      </Flex>
      <IconArrowRight />
    </Flex>
  );
}
