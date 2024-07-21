import { useNavigation } from "@remix-run/react";
import { ItemWithTags } from "~/utils/types.server";
import { createOutstandingTag } from "~/utils/utils";
import ListView, { ListViewProps } from "../base/ListView";
import ItemListView from "./ItemListView";

export default function ItemList({
  w,
  h,
  data,
  totalCount,
  orientation,
  initialItemsPerPage,
  emptyText,
  showPagination,
  withSearch,
  withOffset,
}: Omit<
  ListViewProps<
    Partial<ItemWithTags> & {
      id: number;
      name: string;
      lastLoan?: {
        id: number;
        fullName: string;
        personId: number;
        loanedDate: Date;
        returnedDate?: Date;
      };
    }
  >,
  "children" | "loading"
>) {
  const navigation = useNavigation();

  return (
    <ListView
      w={w}
      h={h}
      data={data}
      totalCount={totalCount}
      emptyText={emptyText}
      orientation={orientation}
      withSearch={withSearch}
      initialItemsPerPage={initialItemsPerPage}
      showPagination={showPagination}
      withOffset={withOffset}
      loading={navigation.state === "loading"}
    >
      {(item, query, qrCode) => {
        return (
          <ItemListView
            {...item}
            tags={[
              ...(item.tags ?? []),
              ...(item._count
                ? [
                    createOutstandingTag({
                      out: item._count.loans > 0,
                      inLabel: "Available",
                    }),
                  ]
                : []),
            ]}
            query={query}
            qrCode={qrCode}
          />
        );
      }}
    </ListView>
  );
}
