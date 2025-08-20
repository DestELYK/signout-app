/**
 * People management route with layout wrapper and create modal functionality
 *
 * This route provides the main people management interface with:
 * - Create person modal dialog with form validation
 * - Person form submission and navigation handling
 * - DataPage layout wrapper for nested routes
 * - Type-safe API responses for person creation
 *
 * @requires @mantine/core Modal component
 * @requires PersonForm component for person creation
 * @requires DataPage layout wrapper
 *
 * @module routes/people
 *
 * @author Kyle Dunn
 */

import { Modal } from "@mantine/core";
import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import DataPage from "~/DataPage";
import PersonForm from "~/components/forms/PersonForm";
import { useCreateModal } from "~/lib/hooks";
import { createPerson } from "~/lib/people.server";

/**
 * Meta function for document head configuration
 * @returns Array of meta tags for the people page
 */
export const meta: MetaFunction = () => {
  return [{ title: "People | SJK Sign-Out" }];
};

/**
 * Server action handler for person operations
 * Handles POST requests for creating new people
 *
 * @param request - The incoming request object
 * @returns JSON response with created person data
 */
export async function action({ request }: ActionFunctionArgs) {
  switch (request.method) {
    case "POST":
      return typedjson(await createPerson(await request.json()));
    default:
      throw new Response(null, {
        status: 405,
      });
  }
}

/**
 * People route component
 * Renders the main people management interface with create modal and data page layout
 *
 * @returns JSX element containing modal and data page components
 */
export default function Page() {
  // Hook for managing create modal state via URL parameters
  const [opened, { open, close }] = useCreateModal();
  const navigate = useNavigate();

  return (
    <>
      {/* Create person modal dialog */}
      <Modal opened={opened} onClose={close} centered={true} title={"Create New Person"}>
        <PersonForm
          type="create"
          initialValues={{
            firstName: "",
            lastName: "",
            schoolId: "",
          }}
          onResult={(personData) => {
            // Navigate to person details and close modal on success
            if (personData.data) {
              close();
              // Navigate to the newly created person's detail page
              navigate(`/people/${personData.data.id}`);
            }
          }}
        />
      </Modal>
      {/* Main data page layout with tabs and create button */}
      <DataPage
        path="people"
        title="People"
        createLabel="Create New Person"
        tabs={["overview", "list", "roles"]}
        onCreateClick={open}
      />
    </>
  );
}
