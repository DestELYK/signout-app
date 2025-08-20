/**
 * Loan details overview route displaying loan information
 *
 * This route provides the default index view for individual loans with:
 * - loan information display
 * - Error handling for invalid or inaccessible loans
 * - Integration with parent loan loader data
 * - Responsive layout with centered error states
 *
 * @requires LoanDetailsView component for loan details display
 * @requires Mantine Center, Text components for error states
 *
 * @module routes/loans_.$loanId._index
 *
 * @author Kyle Dunn
 */

import { Center, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import LoanDetailsView from "~/components/loans/LoanDetailsView";
import { loader } from "./loans_.$loanId";

/**
 * Loan details index page component
 * Displays comprehensive loan information or error state
 *
 * @returns JSX element containing loan details view or error message
 */
export default function Page() {
  // Consume typed loader data from parent loan route
  const loanData = useTypedRouteLoaderData<typeof loader>("routes/loans_.$loanId");

  return loanData?.error ? (
    // Center-aligned error state for invalid or inaccessible loans
    <Center w="100%" h="100%">
      <Text c="red" ta="center">
        {loanData.error}
      </Text>
    </Center>
  ) : (
    // Main loan details view with comprehensive information
    <LoanDetailsView data={loanData?.data} />
  );
}
