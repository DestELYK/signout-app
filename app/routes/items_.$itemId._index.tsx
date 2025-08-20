/**
 * Item details index route displaying item information
 *
 * This route serves as the default view for individual items, displaying:
 * - item details and metadata
 * - Current availability and loan status
 * - Item statistics and usage history
 * - Error handling for missing or invalid items
 *
 * @requires ItemDetailsView component for item display
 * @inherits loader data from parent items_.$itemId route
 *
 * @module routes/items/$itemId/index
 *
 * @author Kyle Dunn
 */

import { Center, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ItemDetailsView from "~/components/items/ItemDetailsView";
import { loader as itemLoader } from "./items_.$itemId";

/**
 * Item details index component
 * Renders comprehensive item information or error state
 *
 * @returns JSX element containing item details or error message
 */
export default function Page() {
  // Get item data from parent route loader
  const itemData = useTypedRouteLoaderData<typeof itemLoader>("routes/items_.$itemId");

  return itemData?.error ? (
    /* Error state display */
    <Center w="100%" h="100%" p="sm">
      <Text c="red" ta="center">
        {itemData.error}
      </Text>
    </Center>
  ) : (
    /* Item details display */
    <ItemDetailsView data={itemData?.data} />
  );
}
