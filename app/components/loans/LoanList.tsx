import { UnstyledButton } from "@mantine/core";
import { NavLink, useNavigation } from "@remix-run/react";
import { LoanWithTagsAndItems } from "~/utils/types.server";
import ListView from "../base/ListView";
import LoanListView from "./LoanListView";

export interface LoanListProps {
  loans?: LoanWithTagsAndItems[];
  totalCount?: number;
  withDetails?: boolean;
  withSearch?: boolean;
  initialItemsPerPage?: number;
}

export function LoanList({
  loans,
  totalCount,
  withDetails = true,
  withSearch = true,
  initialItemsPerPage,
}: LoanListProps) {
  const navigation = useNavigation();

  return (
    <ListView
      data={loans}
      totalCount={totalCount}
      loading={navigation.state === "loading"}
      withSearch={withSearch}
      initialItemsPerPage={initialItemsPerPage}
    >
      {(item, query, qrCode) => (
        <UnstyledButton w="100%" component={NavLink} to={`/loans/${item.id}`}>
          <LoanListView
            id={item.id}
            person={item.person}
            items={withDetails ? item.items.map((i) => i.item) : []}
            tags={item.tags}
            createdDate={item.createdDate}
            outstandingLoans={item._count.items}
            query={withDetails ? query : undefined}
            qrCode={withDetails ? qrCode : undefined}
          />
        </UnstyledButton>
      )}
    </ListView>
  );
}
