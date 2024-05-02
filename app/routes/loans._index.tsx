import { useTypedRouteLoaderData } from "remix-typedjson";
import { LoanList } from "~/components/loans/LoanList";
import { loader as loansLoader } from "./loans";

export default function Page() {
  const data = useTypedRouteLoaderData<typeof loansLoader>("routes/loans");

  return (
    <LoanList
      count={data?.totalCount ?? 0}
      outstandingCount={data?.outCount ?? 0}
      returnedCount={data?.inCount ?? 0}
      loans={(data && data.loans) || []}
    />
  );
}
