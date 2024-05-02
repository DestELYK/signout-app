import { UnstyledButton } from "@mantine/core";
import { NavLink, useSearchParams } from "@remix-run/react";
import { LoanWithTagsAndItems } from "~/utils/types.server";
import ListView from "../base/ListView";
import CreateLoanForm from "./CreateLoanForm";
import LoanListView from "./LoanListView";

export interface LoanListProps {
  count: number;
  outstandingCount: number;
  returnedCount: number;
  loans: LoanWithTagsAndItems[];
}

export function LoanList({
  count,
  outstandingCount,
  returnedCount,
  loans,
}: LoanListProps) {
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
            size: count,
          },
          outstanding: {
            label: "Outstanding",
            items: loans,
            size: outstandingCount,
          },
          returned: {
            label: "Returned",
            items: loans,
            size: returnedCount,
          },
        }}
        itemsPerPage={15}
      >
        {(item, query, qrCode) => (
          <UnstyledButton w="100%" component={NavLink} to={`/loans/${item.id}`}>
            <LoanListView
              id={item.id}
              person={item.person}
              items={item.items.map((i) => i.item)}
              tags={item.tags}
              createdDate={item.createdDate}
              outstandingLoans={item._count.items}
              query={query}
              qrCode={qrCode}
            />
          </UnstyledButton>
        )}
      </ListView>
    </>
  );
}
