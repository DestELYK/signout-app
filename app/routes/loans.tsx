/**
 * Loans management route with layout wrapper and create modal functionality
 *
 * This route provides the main loans management interface with:
 * - Create loan modal dialog
 * - Loan form validation and submission
 * - DataPage layout wrapper for nested routes
 * - Type-safe API responses and error handling
 *
 * @requires @mantine/core Modal component
 * @requires CreateLoanForm component for loan creation
 * @requires DataPage layout wrapper
 *
 * @module routes/loans
 *
 * @author Kyle Dunn
 */

import { Modal } from "@mantine/core";
import { ActionFunctionArgs } from "@remix-run/node";
import { MetaFunction } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import CreateLoanForm from "~/components/forms/CreateLoanForm";
import DataPage from "~/DataPage";
import { useCreateModal } from "~/lib/hooks";
import { createLoan } from "~/lib/loans.server";

/**
 * Meta function for document head configuration
 * @returns Array of meta tags for the loans page
 */
export const meta: MetaFunction = () => {
  return [{ title: "Loans | SJK Sign-Out" }];
};

/**
 * Server action handler for loan operations
 * Handles POST requests for creating new loans
 *
 * @param request - The incoming request object
 * @returns JSON response with created loan data
 */
export async function action({ request }: ActionFunctionArgs) {
  switch (request.method) {
    case "POST":
      return typedjson(await createLoan(await request.json()));
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
}

/**
 * Loans route component
 * Renders the main loans management interface with create modal and data page layout
 *
 * @returns JSX element containing modal and data page components
 */
export default function Page() {
  // Hook for managing create modal state via URL parameters
  const [opened, { open, close }] = useCreateModal();

  return (
    <>
      {/* Create loan modal dialog */}
      <Modal opened={opened} onClose={close} centered={true} title={"Create New Loan"}>
        <CreateLoanForm
          onResult={(data) => {
            // Close modal after loan creation
            close();
          }}
        />
      </Modal>
      {/* Main data page layout with tabs and create button */}
      <DataPage
        path="loans"
        title="Loans"
        createLabel="Create New Loan"
        tabs={["overview", "list"]}
        onCreateClick={open}
      />
    </>
  );
}
