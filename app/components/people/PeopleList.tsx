import {
  Badge,
  Flex,
  Highlight,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { NavLink, useSearchParams } from "@remix-run/react";
import { IconArrowRight } from "@tabler/icons-react";
import { PersonWithTags } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";
import ListView from "../ListView";
import CreatePersonForm from "./CreatePersonForm";

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
            label: "Outstanding",
            items: people.filter((p) => p._count.loans > 0),
          },
          returned: {
            label: "Returned",
            items: people.filter((p) => p._count.loans === 0),
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
            <Flex direction="row" align="center" justify="space-between">
              <Flex w="100%" direction="column">
                <Flex
                  direction="row"
                  align="center"
                  wrap="nowrap"
                  justify="space-between"
                >
                  <Title order={4}>{`#${item.id}`}</Title>
                  <Badge color={item._count.loans > 0 ? "red" : "green"}>
                    {item._count.loans > 0 ? "Outstanding" : "Returned"}
                  </Badge>
                </Flex>
                <Flex
                  direction="row"
                  align="center"
                  wrap="nowrap"
                  justify="space-between"
                >
                  <Highlight
                    highlight={
                      qrCode
                        ? formatFullName(item)
                        : query
                        ? query.split(" ")
                        : ""
                    }
                    component={Title}
                    order={5}
                  >{`${formatFullName(item)}`}</Highlight>
                  {item.tags.map((t) => (
                    <Badge key={t.name} color={t.color}>
                      {t.name}
                    </Badge>
                  ))}
                </Flex>
                <Text size="xs">{item._count.loans} loans currently out</Text>
              </Flex>
              <IconArrowRight />
            </Flex>
          </UnstyledButton>
        )}
      </ListView>
    </>
  );
}
