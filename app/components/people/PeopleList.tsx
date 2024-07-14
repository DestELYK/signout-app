import { Tag } from "@prisma/client";
import { useNavigation } from "@remix-run/react";
import { PersonWithTags } from "~/utils/types.server";
import ListView, { ListViewProps } from "../base/ListView";
import PersonListView from "./PersonListView";

export default function PeopleList({
  data,
  totalCount,
  orientation,
  initialItemsPerPage,
  emptyText,
  showPagination,
  withSearch,
}: Omit<
  ListViewProps<
    Partial<PersonWithTags> & {
      id: number;
      firstName: string;
      lastName: string;
      nickname?: string | null;
      lastLoan?: {
        id: number;
        items: {
          id: number;
          name: string;
          loanedDate: Date;
          returnedDate?: Date;
        };
      };
      invalidItems?: {
        id: number;
        name: string;
        status: Tag;
      }[];
    }
  >,
  "children" | "loading"
>) {
  const navigation = useNavigation();

  return (
    <ListView
      data={data}
      totalCount={totalCount}
      emptyText={emptyText}
      orientation={orientation}
      withSearch={withSearch}
      initialItemsPerPage={initialItemsPerPage}
      showPagination={showPagination}
      loading={navigation.state === "loading"}
    >
      {(item, query, qrCode) => (
        <PersonListView
          id={item.id}
          firstName={item.firstName}
          lastName={item.lastName}
          nickname={item.nickname}
          tags={item.tags}
          totalLoans={item.loans && item.loans.length}
          outstandingLoans={item._count && item._count.loans}
          query={query}
          qrCode={qrCode}
          showChevron={orientation === "vertical"}
          invalidItems={item.invalidItems}
        />
      )}
    </ListView>
  );
}
