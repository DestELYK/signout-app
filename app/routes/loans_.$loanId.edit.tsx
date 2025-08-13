import { Box, Divider, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import LoanForm from "~/components/forms/LoanForm";
import { loader } from "./loans_.$loanId";

export default function Page() {
    const loanData = useTypedRouteLoaderData<typeof loader>("routes/loans_.$loanId");
    const navigate = useNavigate();

    return (
        <>
            <Text fw="bold" visibleFrom="md" p="xs">
                Edit Loan
            </Text>
            <Divider w="100%" visibleFrom="md" />
            <Box p="sm">
                {loanData?.data ? (
                    <LoanForm
                        id={loanData?.data?.id}
                        initialValues={{
                            person: loanData?.data?.person ?? undefined,
                            items:
                                loanData?.data?.items.map((i) => ({
                                    id: i.itemId,
                                    name: i.name,
                                    description: i.description,
                                })) ?? [],
                            tags: loanData?.data?.tags ?? [],
                        }}
                        onResult={(itemData) => {
                            if (itemData.data) {
                                navigate(-1);
                            }
                        }}
                    />
                ) : (
                    <Text c="error">Loan not found</Text>
                )}
            </Box>
        </>
    );
}
