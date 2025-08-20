/**
 * Loan editing route for modifying existing loan information
 *
 * This route provides a loan editing interface including:
 * - Loan form pre-populated with existing data
 * - Person and items association editing
 * - Tag management for loan categorization
 * - Form validation and submission handling
 * - Navigation back to loan details after successful update
 *
 * @requires LoanForm component for loan editing
 * @inherits loader data from parent loans_.$loanId route
 *
 * @module routes/loans/$loanId/edit
 *
 * @author Kyle Dunn
 */

import { Box, Divider, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import LoanForm from "~/components/forms/LoanForm";
import { loader } from "./loans_.$loanId";

/**
 * Loan edit component
 * Renders loan editing form with pre-populated data and update handling
 *
 * @returns JSX element containing loan edit form or error message
 */
export default function Page() {
  // Get loan data from parent route loader
  const loanData = useTypedRouteLoaderData<typeof loader>("routes/loans_.$loanId");
  const navigate = useNavigate();

  return (
    <>
      {/* Edit form header */}
      <Text fw="bold" visibleFrom="md" p="xs">
        Edit Loan
      </Text>
      <Divider w="100%" visibleFrom="md" />

      {/* Loan edit form container */}
      <Box p="sm">
        {loanData?.data ? (
          <LoanForm
            id={loanData?.data?.id}
            initialValues={{
              // Pre-populate form with existing loan data
              person: loanData?.data?.person ?? undefined,
              items:
                // Transform loan items to form format
                loanData?.data?.items.map((i) => ({
                  id: i.itemId,
                  name: i.name,
                  description: i.description,
                })) ?? [],
              tags: loanData?.data?.tags ?? [],
            }}
            onResult={(itemData) => {
              // Navigate back after successful update
              if (itemData.data) {
                navigate(-1);
              }
            }}
          />
        ) : (
          /* Error state for missing loan */
          <Text c="error">Loan not found</Text>
        )}
      </Box>
    </>
  );
}
