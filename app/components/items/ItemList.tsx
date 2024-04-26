import {
  Badge,
  Flex,
  Highlight,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { NavLink, useSearchParams } from "@remix-run/react";
import { IconArrowRight } from "@tabler/icons-react";
import { ItemWithTags } from "~/utils/types.server";
import { dateDiff, formatDate } from "~/utils/utils";
import ListView from "../ListView";
import CreateItemForm from "./CreateItemForm";

export interface ItemListProps {
  items: ItemWithTags[];
}

export default function ItemList({ items }: ItemListProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <>
      <ListView
        title="Items"
        createTitle="Create Item"
        createSection={
          <CreateItemForm
            onSubmitted={(item) => {
              setSearchParams(
                (prev) => {
                  prev.delete("create");
                  return prev;
                },
                {
                  replace: true,
                }
              );
            }}
          />
        }
        data={{
          all: {
            label: "All",
            items: items,
          },
          outstanding: {
            label: "Outstanding",
            items: items.filter((l) => l._count.loans > 0),
          },
          returned: {
            label: "Returned",
            items: items.filter((l) => l._count.loans === 0),
          },
        }}
        itemsPerPage={15}
      >
        {(item, query, qrCode) => (
          <UnstyledButton w="100%" component={NavLink} to={`/items/${item.id}`}>
            <Flex direction="row" align="center" justify="space-between">
              <Flex w="100%" direction="column">
                <Flex
                  direction="row"
                  align="center"
                  wrap="nowrap"
                  justify="space-between"
                >
                  <Title order={4}>{`#${item.id}`}</Title>
                  <Badge color={item._count.loans > 0 ? "red" : "green"}>
                    {item._count.loans > 0 ? "Out" : "In"}
                  </Badge>
                </Flex>
                <Highlight
                  highlight={qrCode ? item.name : query ? query.split(" ") : ""}
                >
                  {item.name}
                </Highlight>
                <Text size="xs">
                  Added: {formatDate(item.createdDate)} (
                  {dateDiff(item.createdDate)})
                </Text>
              </Flex>
              <IconArrowRight />
            </Flex>
          </UnstyledButton>
        )}
      </ListView>
    </>
  );
}
