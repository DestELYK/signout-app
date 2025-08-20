/**
 * Individual loan details route with loan management
 *
 * This route displays information for a specific loan including:
 * - Loan metadata (borrower, items, dates, status)
 * - Current loan status and timeline
 * - Associated items and quantities
 * - Editable notes and administrative actions
 * - Person information and contact details
 *
 * @requires DetailsPage layout component
 * @requires EditableNotes for notes management
 * @requires StatusBadge for status display
 * @requires PersonCard for borrower information
 *
 * @module routes/loans/$loanId
 *
 * @author Kyle Dunn
 */

import { Box, Center, Loader, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { IconDeviceImac, IconInfoCircle, IconListCheck } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import InfoView from "~/components/base/InfoView";
import EditableNotes from "~/components/EditableNotes";
import PersonCard from "~/components/people/PersonCard";
import StatusBadge from "~/components/StatusBadge";
import DetailsPage from "~/DetailsPage";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { deleteLoan, getLoanById, updateLoan } from "~/lib/loans.server";

/**
 * Meta function for dynamic document head configuration
 * Sets page title based on loan ID
 *
 * @param params - Route parameters containing loanId
 * @returns Array of meta tags with dynamic title
 */
export const meta: MetaFunction = ({ params }) => {
  return [{ title: `Loan #${params.loanId}` }];
};

/**
 * Server-side loader function for loan data
 * Fetches loan details by ID parameter
 *
 * @param params - Route parameters containing loanId
 * @returns JSON response with loan data
 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  return typedjson(await getLoanById(params.loanId));
};

/**
 * Server action handler for loan operations
 * Handles PATCH requests for updates and DELETE requests for removal
 *
 * @param params - Route parameters containing loanId
 * @param request - The incoming request object
 * @returns Response based on operation type
 */
export const action = async ({ params, request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "PATCH":
      return typedjson(await updateLoan(params.loanId, await request.json()));
    case "DELETE":
      return typedjson(await deleteLoan(params.loanId));
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
};

export default function Page() {
  const loanData = useTypedLoaderData<typeof loader>();
  const navigate = useNavigate();

  const notificationId = "loan-delete";

  const deleteFetcher = useFetcherWithErrorHandler<typeof action>(
    (loanData) => {
      if (loanData?.data) {
        notifications.update({
          id: notificationId,
          message: "Successfully deleted loan #" + loanData.data.id,
          loading: false,
          autoClose: 5000,
          withCloseButton: true,
        });

        navigate("/loans", { replace: true });
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
    }
  );

  const handleDelete = () => {
    modals.openConfirmModal({
      title: "Delete Loan",
      children: `Are you sure you want to delete loan #${loanData.data?.id}?`,
      onConfirm: () => {
        notifications.show({
          id: notificationId,
          message: "Deleting loan #" + loanData.data?.id,
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
  const infoView = loanData.error ? (
    <Center w="100%" h="100%">
      <Text c="error">{loanData.error}</Text>
    </Center>
  ) : loanData.data === undefined ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : (
    <Stack w="100%">
      <PersonCard
        person={loanData.data?.person}
        returned={
          !loanData.data.items.every(
            (item) =>
              item.dateReturned !== undefined && item.returnedBy?.id === loanData.data?.person.id
          )
        }
      />
      <InfoView title="Notes" cardProps={{ h: undefined, padding: 0 }}>
        <Box p="sm">
          <EditableNotes
            action={`/loans/${loanData.data.id}`}
            value={loanData.data.notes}
            editable
          />
        </Box>
      </InfoView>
    </Stack>
  );

  return loanData.error != undefined ? (
    <Center h="100%">
      <Text c="error">{loanData.error}</Text>
    </Center>
  ) : (
    <DetailsPage
      data={{
        overview: {
          icon: <IconInfoCircle size={24} />,
          label: "Overview",
        },
        items: {
          icon: <IconDeviceImac size={24} />,
          label: "Items",
          count: loanData.data?.itemsCount,
        },
        signin: {
          icon: <IconListCheck size={24} />,
          label: "Sign-In",
        },
      }}
      topSection={<StatusBadge status={loanData.data?.status} />}
      handleDelete={handleDelete}
      tags={loanData.data?.tags}
      disabled={loanData.error != undefined}
      title={`Loan #${loanData.data?.id}`}
      desktopComponent={infoView}
    />
  );
}
