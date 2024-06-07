import { UnstyledButton } from "@mantine/core";
import { NavLink, useNavigation } from "@remix-run/react";
import { PersonWithTags } from "~/utils/types.server";
import ListView from "../base/ListView";
import PersonListView from "./PersonListView";

export interface PeopleListProps {
  people?: PersonWithTags[];
  totalCount?: number;
}

export default function PeopleList({ people, totalCount }: PeopleListProps) {
  const navigation = useNavigation();

  return (
    <ListView
      data={people}
      totalCount={totalCount}
      loading={navigation.state === "loading"}
    >
      {(item, query, qrCode) => (
        <UnstyledButton w="100%" component={NavLink} to={`/people/${item.id}`}>
          <PersonListView
            id={item.id}
            firstName={item.firstName}
            lastName={item.lastName}
            nickname={item.nickname}
            tags={item.tags}
            totalLoans={item.loans.length}
            outstandingLoans={item._count.loans}
            query={query}
            qrCode={qrCode}
          />
        </UnstyledButton>
      )}
    </ListView>
  );
}
