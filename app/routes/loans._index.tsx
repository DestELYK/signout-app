import { LoadingOverlay } from "@mantine/core";
import { useNavigation } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { LoanList } from "~/components/loans/LoanList";
import { loader as loansLoader } from "./loans";

export default function Page() {
  const navigation = useNavigation();
  const data = useTypedRouteLoaderData<typeof loansLoader>("routes/loans");

  return (
    <>
      <LoadingOverlay
        visible={
          navigation.location !== undefined &&
          navigation.location.pathname !== "/loans"
        }
        zIndex={1000}
      />
      <LoanList loans={(data && data.loans) || []} />
    </>
  );
}
