/**
 * Person editing route for modifying existing person information
 *
 * This route provides a person editing interface including:
 * - Person form pre-populated with existing data
 * - Form validation and submission handling
 * - Navigation back to person details after successful update
 * - Error handling and user feedback
 * - Responsive layout with desktop/mobile variants
 *
 * @requires PersonForm component for person editing
 * @inherits loader data from parent people_.$personId route
 *
 * @module routes/people/$personId/edit
 *
 * @author Kyle Dunn
 */

import { Box, Divider, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import PersonForm from "~/components/forms/PersonForm";
import { loader } from "./people_.$personId";

/**
 * Person edit component
 * Renders person editing form with pre-populated data and update handling
 *
 * @returns JSX element containing person edit form
 */
export default function Page() {
  // Get person data from parent route loader
  const personData = useTypedRouteLoaderData<typeof loader>("routes/people_.$personId");
  const navigate = useNavigate();

  return (
    <>
      {/* Edit form header */}
      <Text fw="bold" visibleFrom="md" p="xs">
        Edit Person
      </Text>
      <Divider w="100%" visibleFrom="md" />

      {/* Person edit form container */}
      <Box p="sm">
        <PersonForm
          id={personData?.data?.id}
          initialValues={{
            // Pre-populate form with existing person data
            firstName: personData?.data?.firstName ?? "",
            lastName: personData?.data?.lastName ?? "",
            nickname: personData?.data?.nickname ?? "",
            role: personData?.data?.role ?? undefined,
            schoolId: personData?.data?.schoolId ?? "",
            tags: personData?.data?.tags,
          }}
          onResult={(personData) => {
            // Navigate back after successful update
            if (personData.data) {
              navigate(-1);
            }
          }}
        />
      </Box>
    </>
  );
}
