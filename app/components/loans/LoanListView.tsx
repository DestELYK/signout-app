import {
  Flex,
  Highlight,
  Space,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { Tag } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import { IconArrowRight } from "@tabler/icons-react";
import {
  createOutstandingTag,
  dateDiff,
  formatDate,
  formatFullName,
} from "~/utils/utils";
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
  const navigate = useNavigate();

  return (
    <UnstyledButton
      className="list-item"
      miw={200}
      w="100%"
      h="100%"
      p="xs"
      onClick={() => navigate(`/loans/${id}`)}
    >
      <Flex direction="row" align="center" justify="space-between" gap="xs">
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
          <Highlight
            highlight={query ? query.split(" ") : ""}
          >{`${formatFullName(person)}`}</Highlight>
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
          {items.length > 0 && <Space h="sm" />}
          <Text size="xs">
            Created: {formatDate(createdDate)}{" "}
            <b>({dateDiff({ date: createdDate })})</b>
          </Text>
        </Flex>
        <IconArrowRight />
      </Flex>
    </UnstyledButton>
  );
}
