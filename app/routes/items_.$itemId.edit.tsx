/**
 * Item editing route for modifying existing item information
 *
 * This route provides a item editing interface including:
 * - Item form pre-populated with existing data
 * - Form validation and submission handling
 * - Navigation back to item details after successful update
 * - Error handling and user feedback
 * - Responsive layout with desktop/mobile variants
 *
 * @requires ItemForm component for item editing
 * @inherits loader data from parent items_.$itemId route
 *
 * @module routes/items/$itemId/edit
 *
 * @author Kyle Dunn
 */

import { Box, Divider, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ItemForm from "~/components/forms/ItemForm";
import { loader } from "./items_.$itemId";

/**
 * Item edit component
 * Renders item editing form with pre-populated data and update handling
 *
 * @returns JSX element containing item edit form
 */
export default function Page() {
  // Get item data from parent route loader
  const itemData = useTypedRouteLoaderData<typeof loader>("routes/items_.$itemId");
  const navigate = useNavigate();

  return (
    <>
      {/* Edit form header */}
      <Text fw="bold" visibleFrom="md" p="xs">
        Edit Item
      </Text>
      <Divider w="100%" visibleFrom="md" />

      {/* Item edit form container */}
      <Box p="sm">
        <ItemForm
          id={itemData?.data?.id}
          initialValues={{
            // Pre-populate form with existing item data
            name: itemData?.data?.name ?? "",
            description: itemData?.data?.description ?? "",
            tags: itemData?.data?.tags,
            location: itemData?.data?.location ?? undefined,
            notes: itemData?.data?.notes ?? "",
            status: itemData?.data?.status?.id ?? undefined,
            type: itemData?.data?.type ?? undefined,
          }}
          confirmContent={(values) => <Text>Are you sure you want to update this item?</Text>}
          onResult={(itemData) => {
            // Navigate back after successful update
            if (itemData.data) {
              navigate(-1);
            }
          }}
        />
      </Box>
    </>
  );
}
