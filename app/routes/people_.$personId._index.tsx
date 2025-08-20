/**
 * Person details index route displaying person information
 *
 * This route serves as the default view for individual people, displaying:
 * - person details and contact information
 * - Loan history and current outstanding items
 * - Person statistics and role information
 * - QR code for quick identification
 * - Error handling for missing or invalid persons
 *
 * @requires PersonDetailsView component for person display
 * @inherits loader data from parent people_.$personId route
 *
 * @module routes/people/$personId/index
 *
 * @author Kyle Dunn
 */

import { Center, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import PersonDetailsView from "~/components/people/PersonDetailsView";
import { loader as personLoader } from "./people_.$personId";

/**
 * Person details index component
 * Renders comprehensive person information or error state
 *
 * @returns JSX element containing person details or error message
 */
export default function Page() {
  // Get person data from parent route loader
  const personData = useTypedRouteLoaderData<typeof personLoader>("routes/people_.$personId");

  return personData?.error ? (
    /* Error state display */
    <Center w="100%" h="100%">
      <Text c="red" ta="center">
        {personData.error}
      </Text>
    </Center>
  ) : (
    /* Person details display with comprehensive information */
    <PersonDetailsView data={personData?.data} />
  );
}
