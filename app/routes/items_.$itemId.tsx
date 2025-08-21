/**
 * Individual item details route with item management
 *
 * This route displays information for a specific item including:
 * - Item metadata (name, description, type, location)
 * - Current status and availability
 * - Loan history and current loan information
 * - Editable notes and administrative actions
 *
 * @requires DetailsPage layout component
 * @requires EditableNotes for notes management
 * @requires StatusBadge for status display
 *
 * @module routes/items/$itemId
 *
 * @author Kyle Dunn
 */

import { Center, Group, Loader, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { IconClipboard, IconInfoCircle, IconTimeline } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import DetailsPage from "~/DetailsPage";
import EditableNotes from "~/components/EditableNotes";
import HoverBadge from "~/components/HoverBadge";
import StatusBadge from "~/components/StatusBadge";
import InfoView from "~/components/base/InfoView";
import LocationBadge from "~/components/items/LocationBadge";
import LastLoanView from "~/components/loans/LastLoanView";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { deleteItem, getItemById, updateItem } from "~/lib/items.server";

/**
 * Meta function for dynamic document head configuration
 * Sets page title based on item name or fallback for missing items
 *
 * @param data - Loader data containing item information
 * @returns Array of meta tags with dynamic title
 */
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: (data.item ? data.item.name : "No Item Found") + " | SJK Sign-Out",
    },
  ];
};

/**
 * Server-side loader function for item data
 * Fetches item details by ID parameter
 *
 * @param params - Route parameters containing itemId
 * @returns JSON response with item data
 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  return typedjson(await getItemById(params.itemId));
};

/**
 * Server action handler for item operations
 * Handles PATCH requests for updates and DELETE requests for removal
 *
 * @param params - Route parameters containing itemId
 * @param request - The incoming request object
 * @returns Response based on operation type
 */
export const action = async ({ params, request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "PATCH":
      return updateItem(params.itemId, await request.json());
    case "DELETE":
      return deleteItem(params.itemId);
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
};

export default function Page() {
  const itemData = useTypedLoaderData<typeof loader>();
  const navigate = useNavigate();

  const notificationId = "item-delete";

  const deleteFetcher = useFetcherWithErrorHandler<typeof action>(
    (itemData) => {
      if (itemData?.data) {
        notifications.update({
          id: notificationId,
          message: "Successfully deleted " + itemData.data.name,
          loading: false,
          autoClose: 5000,
          withCloseButton: true,
        });

        navigate("/items/list", { replace: true });
      }
    },
    (error) => {
      notifications.update({
        id: notificationId,
        message: error,
        color: "red",
        loading: false,
        autoClose: 5000,
        withCloseButton: true,
      });
    } //
  );

  const handleDelete = () => {
    modals.openConfirmModal({
      title: "Delete Item",
      children: `Are you sure you want to delete ${itemData.data?.name}?`,
      onConfirm: () => {
        notifications.show({
          id: notificationId,
          message: "Deleting " + itemData.data?.name,
          loading: true,
          autoClose: false,
          withCloseButton: true,
        });

        deleteFetcher.submit(null, { method: "DELETE" });
      },
      labels: {
        cancel: "Cancel",
        confirm: "Delete",
      },
    });
  };

  const itemInfo = itemData.error ? (
    <Center w="100%" h="100%">
      <Text c="error">{itemData.error}</Text>
    </Center>
  ) : itemData.data === undefined ? (
    <Loader />
  ) : (
    <Stack w="100%" h="100%">
      <LastLoanView data={itemData.data.lastLoan} showItems={false} prefix="Last Loan" />

      <InfoView title="Notes" cardProps={{ h: undefined }} headerProps={{ mb: "sm" }}>
        <EditableNotes action={`/items/${itemData.data.id}`} value={itemData.data.notes} editable />
      </InfoView>
    </Stack>
  );

  return (
    <DetailsPage
      data={{
        overview: {
          icon: <IconInfoCircle size={24} />,
          label: "Overview",
        },
        loans: {
          icon: <IconClipboard size={24} />,
          label: "Loans",
          count: itemData.data?.totalLoansCount,
        },
        timeline: {
          icon: <IconTimeline size={24} />,
          label: "Timeline",
        },
      }}
      topSection={
        <Group gap="xs">
          <StatusBadge status={itemData.data?.status} clickable redirectRoute="items" />{" "}
          {itemData.data?.type !== undefined && (
            <HoverBadge
              name={itemData.data.type.name}
              description={itemData.data.type.description}
              clickable
              redirectRoute="items"
              filterParam="type"
              filterValue={itemData.data.type.name}
            />
          )}
          {itemData.data?.location !== undefined && (
            <LocationBadge data={itemData.data.location} clickable redirectRoute="items" />
          )}
        </Group>
      }
      handleDelete={handleDelete}
      tags={itemData.data?.tags ?? []}
      tagsRedirectRoute="items"
      title={itemData.data?.name}
      disabled={itemData.error != undefined}
      desktopComponent={itemInfo}
    />
  );
}
