import { UnstyledButton } from "@mantine/core";
import { NavLink, useSearchParams } from "@remix-run/react";
import { PersonWithTags } from "~/utils/types.server";
import ListView from "../base/ListView";
import CreatePersonForm from "./CreatePersonForm";
import PersonListView from "./PersonListView";

export interface PeopleListProps {
  people: PersonWithTags[];
  totalCount: number;
  studentCount: number;
  staffCount: number;
}

export default function PeopleList({
  people,
  totalCount,
  studentCount,
  staffCount,
}: PeopleListProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <>
      <ListView
        title="People"
        createTitle="Create Person"
        createSection={
          <CreatePersonForm
            onSubmitted={(person) => {
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
            items: people,
            size: totalCount,
          },
          students: {
            label: "Students",
            items: people,
            size: studentCount,
          },
          staff: {
            label: "Staff",
            items: people,
            size: staffCount,
          },
        }}
        itemsPerPage={15}
      >
        {(item, query, qrCode) => (
          <UnstyledButton
            w="100%"
            component={NavLink}
            to={`/people/${item.id}`}
          >
            <PersonListView
              id={item.id}
              firstName={item.firstName}
              lastName={item.lastName}
              nickname={item.nickname}
              tags={item.tags}
              outstandingLoans={item._count.loans}
              query={query}
              qrCode={qrCode}
            />
          </UnstyledButton>
        )}
      </ListView>
    </>
  );
}
