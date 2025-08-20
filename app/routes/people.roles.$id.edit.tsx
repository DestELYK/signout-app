/**
 * Person role editing route for modifying existing role information
 *
 * This route provides person role editing functionality with:
 * - Pre-populated role form with existing data
 * - Role name, color, and description editing
 * - Form validation and submission handling
 * - Navigation back to role details or roles list
 *
 * @requires PersonRoleForm component for role editing
 * @requires Mantine Center, Text components for error states
 * @inherits loader data from parent people.roles.$id route
 *
 * @module routes/people/roles/$id/edit
 *
 * @author Kyle Dunn
 */

import { Center, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import PersonRoleForm from "~/components/forms/PersonRoleForm";
import { loader } from "./people.roles.$id";

/**
 * Person role edit page component
 * Renders role editing form with pre-populated data or error state
 *
 * @returns JSX element containing role edit form or error message
 */
export default function Page() {
  // Get role data from parent route loader
  const data = useTypedRouteLoaderData<typeof loader>("routes/people.roles.$id");
  const navigate = useNavigate();

  return data && data.data ? (
    // Person role edit form with pre-populated values
    <PersonRoleForm
      id={data.data.id}
      initialValues={{
        name: data.data.name,
        color: data.data.color,
        description: data.data.description,
      }}
      onResult={(result) => {
        if (result.data) {
          // Navigate back to role details on successful update
          navigate(`/people/roles/${result.data?.id}`);
        } else {
          // Navigate to roles list on failure/cancellation
          navigate("/people/roles");
        }
      }}
    />
  ) : (
    // Error state for missing or invalid role
    <Center w="100%" h="100%">
      <Text c="error">Person Role not found</Text>
    </Center>
  );
}
