import { Center, Skeleton, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import LoanInfoView from "~/components/loans/LoanInfoView";
import { loader } from "./loans.$loanId";

export default function Page() {
  const data = useTypedRouteLoaderData<typeof loader>("routes/loans.$loanId");

  return (
    <>
      {data !== undefined ? (
        data.error !== undefined ? (
          <Center w="100%" h="100%">
            <Text ta="center">{data.error}</Text>
          </Center>
        ) : data.loan !== undefined && data.outstandingItems !== undefined ? (
          <LoanInfoView
            id={data.loan.id}
            person={data.loan.person}
            tags={data.loan.tags}
            notes={data.loan.notes}
            createdDate={data.loan.createdDate}
            updatedDate={data.loan.updatedDate}
            outstandingItems={data.outstandingItems}
            items={data.loan._count.items}
          />
        ) : (
          <>?</>
        )
      ) : (
        <>
          <Skeleton h={160} />
          <Skeleton h={130} />
        </>
      )}
    </>
  );
}
