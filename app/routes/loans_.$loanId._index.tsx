import { Center, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import LoanDetailsView from "~/components/loans/LoanDetailsView";
import { loader } from "./loans_.$loanId";

export default function Page() {
    const loanData = useTypedRouteLoaderData<typeof loader>("routes/loans_.$loanId");

    return loanData?.error ? (
        <Center w="100%" h="100%">
            <Text c="red" ta="center">
                {loanData.error}
            </Text>
        </Center>
    ) : (
        <LoanDetailsView data={loanData?.data} />
    );
}
