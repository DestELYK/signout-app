import {
  Flex,
  Group,
  Highlight,
  Space,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { Tag } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import { IconArrowRight } from "@tabler/icons-react";
import { IN_COLOR, OUT_COLOR } from "~/utils/consts";
import { formatFullName } from "~/utils/utils";
import TagGroup from "../tags/TagGroup";

export interface PersonListViewProps {
  id: number;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  tags?: Tag[];
  totalLoans?: number;
  outstandingLoans?: number;
  query?: string;
  qrCode?: string;
  showChevron?: boolean;
  invalidItems?: {
    id: number;
    name: string;
    status: Tag;
  }[];
}

export default function PersonListView({
  id,
  firstName,
  lastName,
  nickname,
  tags = [],
  totalLoans,
  outstandingLoans,
  query,
  qrCode,
  showChevron = true,
  invalidItems,
}: PersonListViewProps) {
  const navigate = useNavigate();
  const fullName = formatFullName({
    firstName: firstName,
    lastName: lastName,
    nickname: nickname,
  });

  return (
    <UnstyledButton
      className="list-item"
      miw={200}
      w="100%"
      h="100%"
      p="xs"
      onClick={() => navigate(`/people/${id}`)}
    >
      <Flex
        h="100%"
        w="100%"
        direction="row"
        align="center"
        justify="space-between"
      >
        <Flex w="100%" h="100%" direction="column" mr="lg" align="center">
          <Group align="center" gap="xs">
            <Highlight
              highlight={qrCode ? fullName : query ? query.split(" ") : ""}
              component={Title}
              order={4}
              ta="center"
            >
              {fullName}
            </Highlight>
            <TagGroup tags={tags} categories={["Person Role"]} />
          </Group>
          <Space h="sm" />
          {totalLoans !== undefined && (
            <Text size="xs">
              {totalLoans > 0
                ? totalLoans + " total loan" + (totalLoans > 1 ? "s" : "")
                : "No loans"}
            </Text>
          )}
          {outstandingLoans !== undefined && (
            <Text size="xs" c={outstandingLoans > 0 ? OUT_COLOR : IN_COLOR}>
              {outstandingLoans
                ? outstandingLoans +
                  " loan" +
                  (outstandingLoans > 1 ? "s" : "") +
                  " currently out"
                : "No loans currently out"}
            </Text>
          )}
          {invalidItems &&
            invalidItems.length > 0 &&
            invalidItems.map((item) => (
              <Text size="xs">
                {item.name} is{" "}
                <Text inherit span fw="bold" c={item.status.color}>
                  {item.status.name}
                </Text>
              </Text>
            ))}
        </Flex>
        {showChevron && <IconArrowRight size={24} />}
      </Flex>
    </UnstyledButton>
  );
}
