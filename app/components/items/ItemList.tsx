import { useNavigation } from "@remix-run/react";
import { ItemWithTags } from "~/utils/types.server";
import { createOutstandingTag } from "~/utils/utils";
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
        );
      }}
    </ListView>
  );
}
