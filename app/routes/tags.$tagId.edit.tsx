/**
 * Tag editing route for modifying existing tag information
 *
 * This route provides tag editing functionality with:
 * - Pre-populated tag form with existing data
 * - Tag name, color, category, priority, and visibility editing
 * - Form validation and submission handling
 * - Navigation back to tag details or tags list
 *
 * @requires TagForm component for tag editing
 * @requires Mantine Center, Text components for error states
 * @inherits loader data from parent tags.$tagId route
 *
 * @module routes/tags/$tagId/edit
 *
 * @author Kyle Dunn
 */

import { Center, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import TagForm from "~/components/forms/TagForm";
import { loader } from "./tags.$tagId";

/**
 * Tag edit page component
 * Renders tag editing form with pre-populated data or error state
 *
 * @returns JSX element containing tag edit form or error message
 */
export default function Page() {
  // Get tag data from parent route loader
  const data = useTypedRouteLoaderData<typeof loader>("routes/tags.$tagId");
  const navigate = useNavigate();

  return data && data.tag ? (
    // Tag edit form with pre-populated values
    <TagForm
      id={data.tag.id}
      initialValues={{
        name: data.tag.name,
        color: data.tag.color,
        category: data.tag.category,
        priority: data.tag.priority,
        hidden: data.tag.hidden,
      }}
      onResult={(result) => {
        if (result.data) {
          // Navigate back to tag details on successful update
          navigate(`/tags/${result.data?.id}`);
        } else {
          // Navigate to tags list on failure/cancellation
          navigate("/tags");
        }
      }}
    />
  ) : (
    // Error state for missing or invalid tag
    <Center w="100%" h="100%">
      <Text c="error">Tag not found</Text>
    </Center>
  );
}
