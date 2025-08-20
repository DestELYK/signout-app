/**
 * Item type editing route for modifying existing type information
 *
 * This route provides item type editing functionality with:
 * - Pre-populated type form with existing data
 * - Type name and description editing
 * - Form validation and submission handling
 * - Navigation back to type details or types list
 *
 * @requires ItemTypeForm component for type editing
 * @requires Mantine Center, Text components for error states
 * @inherits loader data from parent items.types.$id route
 *
 * @module routes/items/types/$id/edit
 *
 * @author Kyle Dunn
 */

import { Center, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ItemTypeForm from "~/components/forms/ItemTypeForm";
import { loader } from "./items.types.$id";

/**
 * Item type edit page component
 * Renders type editing form with pre-populated data or error state
 *
 * @returns JSX element containing type edit form or error message
 */
export default function Page() {
  // Get type data from parent route loader
  const data = useTypedRouteLoaderData<typeof loader>("routes/items.types.$id");
  const navigate = useNavigate();

  return data && data.data ? (
    // Item type edit form with pre-populated values
    <ItemTypeForm
      id={data.data.id}
      initialValues={{
        name: data.data.name,
        description: data.data.description,
      }}
      onResult={(result) => {
        if (result.data) {
          // Navigate back to type details on successful update
          navigate(`/items/types/${result.data?.id}`);
        } else {
          // Navigate to types list on failure/cancellation
          navigate("items/types");
        }
      }}
    />
  ) : (
    // Error state for missing or invalid type
    <Center w="100%" h="100%">
      <Text c="error">Item Type not found</Text>
    </Center>
  );
}
