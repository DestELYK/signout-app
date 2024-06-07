import { UnstyledButton } from "@mantine/core";
import { NavLink, useNavigation } from "@remix-run/react";
import { ItemWithTags } from "~/utils/types.server";
import { createOutstandingTag } from "../OutstandingBadge";
import ListView from "../base/ListView";
import ItemListView from "./ItemListView";

export interface ItemListProps {
  items?: ItemWithTags[];
  totalCount?: number;
}

export default function ItemList({ items, totalCount }: ItemListProps) {
  const navigation = useNavigation();

  return (
    <ListView
      data={items}
      totalCount={totalCount}
      loading={navigation.state === "loading"}
    >
      {(item, query, qrCode) => {
        return (
          <UnstyledButton w="100%" component={NavLink} to={`/items/${item.id}`}>
            <ItemListView
              {...item}
              tags={[
                ...item.tags,
                createOutstandingTag({
                  out: item._count.loans > 0,
                  inLabel: "Available",
                }),
              ]}
              query={query}
              qrCode={qrCode}
            />
          </UnstyledButton>
        );
      }}
    </ListView>
  );
}
