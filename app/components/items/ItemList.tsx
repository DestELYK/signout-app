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
import { dateDiff, filterTags, formatDate } from "~/utils/utils";
import ListView from "../ListView";
import CreateItemForm from "./CreateItemForm";

export interface ItemListProps {
  items: ItemWithTags[];
  missingItems: ItemWithTags[];
}

export default function ItemList({ items, missingItems }: ItemListProps) {
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
          missing: {
            label: "Missing",
            items: missingItems,
          },
        }}
        itemsPerPage={15}
      >
        {(item, query, qrCode) => {
          const locationTag = item.tags.find((t) => t.id === item.locationId);

          const itemStatus = filterTags(item.tags, "Item Status")[0];

          return (
            <UnstyledButton
              w="100%"
              component={NavLink}
              to={`/items/${item.id}`}
            >
              <Flex direction="row" align="center" justify="space-between">
                <Flex w="100%" direction="column">
                  <Flex
                    direction="row"
                    align="center"
                    wrap="nowrap"
                    justify="space-between"
                  >
                    <Title order={4}>{`#${item.id}`}</Title>
                    {itemStatus ? (
                      <Badge color={itemStatus.color} autoContrast>
                        {itemStatus.name}
                      </Badge>
                    ) : (
                      <Badge
                        color={item._count.loans > 0 ? "red" : "green"}
                        autoContrast
                      >
                        {item._count.loans > 0 ? "Out" : "In"}
                      </Badge>
                    )}
                  </Flex>
                  <Flex
                    direction="row"
                    align="center"
                    wrap="nowrap"
                    justify="space-between"
                  >
                    <Highlight
                      highlight={
                        qrCode ? item.name : query ? query.split(" ") : ""
                      }
                    >
                      {item.name}
                    </Highlight>
                    {locationTag && (
                      <Badge color={locationTag.color} autoContrast>
                        {locationTag.name}
                      </Badge>
                    )}
                  </Flex>
                  <Text size="xs">
                    Added: {formatDate(item.createdDate)} (
                    {dateDiff(item.createdDate)})
                  </Text>
                </Flex>
                <IconArrowRight />
              </Flex>
            </UnstyledButton>
          );
        }}
      </ListView>
    </>
  );
}
