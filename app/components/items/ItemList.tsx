import { UnstyledButton } from "@mantine/core";
import { NavLink, useSearchParams } from "@remix-run/react";
import { ItemWithTags } from "~/utils/types.server";
import { createOutstandingTag } from "../OutstandingBadge";
import ListView from "../base/ListView";
import CreateItemForm from "./CreateItemForm";
import ItemListView from "./ItemListView";

export interface ItemListProps {
  items?: ItemWithTags[];
  totalCount: number;
  outstandingCount: number;
  missingCount: number;
}

export default function ItemList({
  items,
  totalCount,
  outstandingCount,
  missingCount,
}: ItemListProps) {
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
            size: totalCount,
          },
          outstanding: {
            label: "Outstanding",
            items: items,
            size: outstandingCount,
          },
          missing: {
            label: "Missing",
            items: items,
            size: missingCount,
          },
        }}
        itemsPerPage={15}
      >
        {(item, query, qrCode) => {
          return (
            <UnstyledButton
              w="100%"
              component={NavLink}
              to={`/items/${item.id}`}
            >
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
    </>
  );
}
