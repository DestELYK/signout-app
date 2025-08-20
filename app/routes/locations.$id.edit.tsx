/**
 * Location editing route for modifying existing location information
 *
 * This route provides location editing functionality with:
 * - Pre-populated location form with existing data
 * - Location name editing and validation
 * - Form submission with success/error handling
 * - Navigation back to location details or locations list
 *
 * @requires LocationForm component for location editing
 * @requires Mantine Center, Text components for error states
 * @inherits loader data from parent locations.$id route
 *
 * @module routes/locations.$id.edit
 *
 * @author Kyle Dunn
 */

import { Center, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import LocationForm from "~/components/forms/LocationForm";
import { loader } from "./locations.$id";

/**
 * Location edit page component
 * Renders location editing form with pre-populated data or error state
 *
 * @returns JSX element containing location edit form or error message
 */
export default function Page() {
  // Get location data from parent route loader
  const data = useTypedRouteLoaderData<typeof loader>("routes/locations.$id");
  const navigate = useNavigate();

  return data && data.data ? (
    // Location edit form with pre-populated values
    <LocationForm
      id={data.data.id}
      initialValues={{
        name: data.data.name,
      }}
      onResult={(result) => {
        if (result.data) {
          // Navigate back to location details on successful update
          navigate(`/locations/${result.data?.id}`);
        } else {
          // Navigate to locations list on failure/cancellation
          navigate("/locations");
        }
      }}
    />
  ) : (
    // Error state for missing or invalid location
    <Center w="100%" h="100%">
      <Text c="error">Location not found</Text>
    </Center>
  );
}
