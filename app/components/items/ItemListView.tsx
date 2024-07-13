import {
  Flex,
  Highlight,
  Space,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { Tag } from "@prisma/client";
import { Link } from "@remix-run/react";
import { IconChevronRight } from "@tabler/icons-react";
import { dateDiff, formatDate } from "~/utils/utils";
import TagGroup from "../tags/TagGroup";

export interface ItemListViewProps {
  id: number;
  name: string;
  description?: string;
  createdDate?: Date;
  tags?: Tag[];
  qrCode?: string;
  query?: string;
  lastLoan?: {
    id: number;
    fullName: string;
    personId: number;
    loanedDate: Date;
    returnedDate?: Date;
  };
}

export default function ItemListView({
  id,
  name,
  description,
  createdDate,
  tags = [],
  qrCode,
  query,
  lastLoan,
}: ItemListViewProps) {
  return (
    <UnstyledButton w="100%" component={Link} to={`/items/${id}`}>
      <Flex direction="row" align="center" justify="space-between">
        <Flex w="100%" direction="column" mr="lg">
          <Flex
            direction="row"
            align="center"
            wrap="nowrap"
            justify="space-between"
          >
            <Highlight
              component={Title}
              order={4}
              highlight={qrCode ? name : query ? query.split(" ") : ""}
            >
              {name}
            </Highlight>
            <TagGroup tags={tags} categories={["Item Status"]} limit={1} />
          </Flex>
          <Flex
            direction="row"
            align="center"
            wrap="nowrap"
            justify="space-between"
          >
            <TagGroup tags={tags} categories={["Location"]} />
          </Flex>
          <Space h="xs" />
          {description && (
            <Text size="xs" fs="italic" lineClamp={1} mt="xs">
              {description}
            </Text>
          )}

          {createdDate && (
            <Text size="xs">
              Added:{" "}
              {formatDate(createdDate, {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}{" "}
              <b>({dateDiff({ date: createdDate })})</b>
            </Text>
          )}

          {lastLoan && (
            <>
              <Text size="xs">
                Last Loaned by{" "}
                <Link
                  to={`/people/${lastLoan.personId}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  {lastLoan.fullName}
                </Link>
              </Text>
              <Text size="xs">
                {lastLoan.returnedDate ? "Returned" : "Loaned"}{" "}
                {formatDate(lastLoan.loanedDate, {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}{" "}
                <b>
                  (
                  {dateDiff({
                    date: lastLoan.loanedDate,
                    otherDate: lastLoan.returnedDate,
                    withoutSuffix: lastLoan.returnedDate !== undefined,
                  })}
                  )
                </b>
              </Text>
            </>
          )}
        </Flex>
        <IconChevronRight />
      </Flex>
    </UnstyledButton>
  );
}
