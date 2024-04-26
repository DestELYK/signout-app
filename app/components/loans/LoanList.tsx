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
import { LoanWithTagsAndItems } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import ListView from "../ListView";
import CreateLoanForm from "./CreateLoanForm";

export interface LoanListProps {
  loans: LoanWithTagsAndItems[];
}

export function LoanList({ loans }: LoanListProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <>
      <ListView
        title="Loans"
        createTitle="Sign-Out Items"
        createSection={
          <CreateLoanForm
            onSubmitted={(loan) => {
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
            items: loans,
          },
          outstanding: {
            label: "Outstanding",
            items: loans.filter((l) => l._count.items > 0),
          },
          returned: {
            label: "Returned",
            items: loans.filter((l) => l._count.items === 0),
          },
        }}
        itemsPerPage={15}
      >
        {(item, query, qrCode) => (
          <UnstyledButton w="100%" component={NavLink} to={`/loans/${item.id}`}>
            <Flex direction="row" align="center" justify="space-between">
              <Flex w="100%" direction="column">
                <Flex
                  direction="row"
                  align="center"
                  wrap="nowrap"
                  justify="space-between"
                >
                  <Title order={4}>{`#${item.id}`}</Title>
                  <Badge color={item._count.items > 0 ? "red" : "green"}>
                    {item._count.items > 0 ? "Out" : "In"}
                  </Badge>
                </Flex>
                <Highlight
                  highlight={query ? query.split(" ") : ""}
                >{`${formatFullName(item.person)}`}</Highlight>
                {item.items.slice(0, 2).map((i) => (
                  <Highlight
                    key={i.item.id}
                    size="xs"
                    highlight={
                      qrCode && i.item.qrCode === qrCode
                        ? i.item.name
                        : query
                        ? query.split(" ")
                        : ""
                    }
                  >
                    {i.item.name}
                  </Highlight>
                ))}
                {item.items.length > 2 && (
                  <Text fs="italic" size="xs">
                    ...and {item.items.length - 2} other items
                  </Text>
                )}
                <Text size="xs" mt="sm">
                  Created: {formatDate(item.createdDate)} (
                  {dateDiff(item.createdDate)})
                </Text>
              </Flex>
              <IconArrowRight />
            </Flex>
          </UnstyledButton>
        )}
      </ListView>
    </>
  );
}
