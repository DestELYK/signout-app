import { useNavigation } from "@remix-run/react";
import { LoanWithTagsAndItems } from "~/utils/types.server";
import ListView, { ListViewProps } from "../base/ListView";
import LoanListView from "./LoanListView";

export function LoanList({
  w,
  h,
  data,
  totalCount,
  orientation,
  initialItemsPerPage,
  emptyText,
  showPagination,
  withSearch,
  withDetails,
  withOffset,
}: Omit<
  ListViewProps<LoanWithTagsAndItems> & {
    withDetails?: boolean;
  },
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
      {(item, query, qrCode) => (
        <LoanListView
          id={item.id}
          person={item.person}
          items={withDetails ? item.items?.map((i) => i.item) : []}
          tags={item.tags}
          createdDate={item.createdDate}
          outstandingLoans={item._count.items}
          query={withDetails ? query : undefined}
          qrCode={withDetails ? qrCode : undefined}
        />
      )}
    </ListView>
  );
}
