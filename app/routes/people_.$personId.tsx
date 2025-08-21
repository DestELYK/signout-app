/**
 * Individual person details route with person management
 *
 * This route displays information for a specific person including:
 * - Person metadata (name, nickname, school ID, role)
 * - Current loan status and history
 * - Contact information and administrative details
 * - Editable notes and person management actions
 * - Last loan information and outstanding items
 *
 * @requires DetailsPage layout component
 * @requires EditableNotes for notes management
 * @requires LastLoanView for loan history
 * @requires InfoView for person details display
 *
 * @module routes/people/$personId
 *
 * @author Kyle Dunn
 */

import { Center, Stack, Text } from "@mantine/core";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { IconClipboard, IconInfoCircle } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import DetailsPage from "~/DetailsPage";
import EditableNotes from "~/components/EditableNotes";
import HoverBadge from "~/components/HoverBadge";
import InfoView from "~/components/base/InfoView";
import LastLoanView from "~/components/loans/LastLoanView";
import { deletePerson, getPersonById, updatePerson } from "~/lib/people.server";
import { formatFullName } from "~/utils/utils";

import { upperFirst } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { ActionFunctionArgs } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { useFetcherWithErrorHandler } from "~/lib/hooks";

/**
 * Meta function for dynamic document head configuration
 * Sets page title based on person name or fallback for missing persons
 *
 * @param data - Loader data containing person information
 * @returns Array of meta tags with dynamic title
 */
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: (data.person ? formatFullName(data.person) : "No Person Found") + " | SJK Sign-Out",
    },
  ];
};

/**
 * Server-side loader function for person data
 * Fetches person details by ID parameter
 *
 * @param params - Route parameters containing personId
 * @returns JSON response with person data
 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  return typedjson(await getPersonById(params.personId));
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "PATCH":
      return updatePerson(params.personId, await request.json());
    case "DELETE":
      return deletePerson(params.personId);
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
};

export default function Page() {
  const personData = useTypedLoaderData<typeof loader>();
  const navigate = useNavigate();

  const fullName = personData.data ? formatFullName(personData.data) : "Unknown";

  const notificationId = "person-delete";

  const deleteFetcher = useFetcherWithErrorHandler<typeof action>(
    (data) => {
      if (data?.data) {
        notifications.update({
          id: notificationId,
          message: "Successfully deleted person " + formatFullName(data.data),
          loading: false,
          autoClose: 5000,
          withCloseButton: true,
        });

        navigate("/people", { replace: true });
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
      title: "Delete Person",
      children: `Are you sure you want to delete ${fullName}?`,
      onConfirm: () => {
        notifications.show({
          id: notificationId,
          message: "Deleting person " + fullName,
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

  const personView = personData.error ? (
    <Center w="100%" h="100%">
      <Text c="error">{personData.error}</Text>
    </Center>
  ) : personData.data === undefined ? (
    <Center w="100%" h="100%">
      <Text>No person found</Text>
    </Center>
  ) : (
    <Stack w="100%">
      <LastLoanView
        w="100%"
        data={personData.data.lastLoan}
        showPerson={false}
        prefix="Last Loan:"
      />

      <InfoView title="Notes" cardProps={{ h: undefined }} headerProps={{ mb: "sm" }}>
        <EditableNotes
          //action={`/items/${data.item.id}`}
          value={personData.data.notes}
          editable
        />
      </InfoView>
    </Stack>
  );

  return personData.error != undefined ? (
    <Center h="100%">
      <Text c="error">{personData.error}</Text>
    </Center>
  ) : (
    <DetailsPage
      data={{
        overview: {
          icon: <IconInfoCircle size={24} />,
          label: "Overview",
        },
        loans: {
          icon: <IconClipboard size={24} />,
          label: "Loans",
          count: personData.data?.loansCount,
        },
      }}
      topSection={
        personData.data &&
        personData.data.role && (
          <HoverBadge
            name={personData.data.role.name}
            color={personData.data.role.color}
            clickable
            redirectRoute="people"
            filterParam="role"
            filterValue={personData.data.role.id.toString()}
          />
        )
      }
      bannerText={upperFirst(
        [
          (personData.data?.outstandingItemsCount ?? 0) > 1
            ? "more than one outstanding item"
            : undefined,
          (personData.data?.lostItemsCount ?? 0) > 0 ? "problem items" : undefined,
        ]
          .filter((x) => x)
          .join(" & ")
      )}
      handleDelete={handleDelete}
      tags={personData.data?.tags}
      tagsRedirectRoute="people"
      disabled={personData.error != undefined}
      desktopComponent={personView}
      title={personData.data ? formatFullName(personData.data) : "Unknown"}
    />
  );
}
