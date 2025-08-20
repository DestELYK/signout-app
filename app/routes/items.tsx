/**
 * Items management route with layout wrapper and create modal functionality
 *
 * This route provides the main items management interface with:
 * - Create item modal dialog
 * - Item form validation and submission
 * - DataPage layout wrapper for nested routes
 * - Error handling for item creation operations
 *
 * @requires @mantine/core Modal component
 * @requires ItemForm component for item creation
 * @requires DataPage layout wrapper
 *
 * @module routes/items
 *
 * @author Kyle Dunn
 */

import { Modal } from "@mantine/core";
import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import ItemForm from "~/components/forms/ItemForm";
import DataPage from "~/DataPage";
import { handleError } from "~/lib/db.server";
import { useCreateModal } from "~/lib/hooks";
import { createItem } from "~/lib/items.server";
import { ItemFormSchema } from "~/lib/schemas";

/**
 * Meta function for document head configuration
 * @returns Array of meta tags for the items page
 */
export const meta: MetaFunction = () => {
  return [{ title: "Items | SJK Sign-Out" }];
};

/**
 * Server action handler for item operations
 * Handles POST requests for creating new items with validation
 *
 * @param request - The incoming request object
 * @returns JSON response with created item data or error information
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    switch (request.method) {
      case "POST":
        // Parse and validate form data using Zod schema
        const result = ItemFormSchema.parse(await request.json());

        return typedjson(await createItem(result));
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    return typedjson({ error: handleError(e, "creating item") });
  }
}

/**
 * Items route component
 * Renders the main items management interface with create modal and data page layout
 *
 * @returns JSX element containing modal and data page components
 */
export default function Page() {
  // Hook for managing create modal state via URL parameters
  const [opened, { open, close }] = useCreateModal();

  return (
    <>
      {/* Create item modal dialog */}
      <Modal opened={opened} onClose={close} centered={true} title={"Create New Item"}>
        <ItemForm
          type="create"
          onResult={(data) => {
            // Close modal on successful item creation
            if (data.data) {
              close();
            }
          }}
          initialValues={{
            name: "",
            description: "",
            notes: "",
          }}
        />
      </Modal>
      {/* Main data page layout with tabs and create button */}
      <DataPage
        path="items"
        title="Items"
        createLabel="Create New Item"
        tabs={["overview", "list", "types"]}
        onCreateClick={open}
      />
    </>
  );
}
