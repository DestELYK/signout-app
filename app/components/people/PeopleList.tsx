import { UnstyledButton } from "@mantine/core";
import { NavLink, useSearchParams } from "@remix-run/react";
import { PersonWithTags } from "~/utils/types.server";
import { filterTags } from "~/utils/utils";
import ListView from "../base/ListView";
import CreatePersonForm from "./CreatePersonForm";
import PersonListView from "./PersonListView";

export interface PeopleListProps {
  people: PersonWithTags[];
}

export default function PeopleList({ people }: PeopleListProps) {
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
          },
          outstanding: {
            label: "Students",
            items: people.filter(
              (p) => filterTags(p.tags, "Person Role")[0].name !== "Staff"
            ),
          },
          returned: {
            label: "Staff",
            items: people.filter(
              (p) => filterTags(p.tags, "Person Role")[0].name === "Staff"
            ),
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
