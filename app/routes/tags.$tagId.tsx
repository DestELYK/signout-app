/**
 * Individual tag details route with tag management
 *
 * This route displays information for a specific tag including:
 * - Tag metadata (name, category, color, usage statistics)
 * - Associated items, people, and loans count
 * - Edit and delete operations for the tag
 * - Navigation to tag editing and related operations
 * - Category-based tag grouping and statistics
 *
 * @requires InfoView for tag details display
 * @requires Confirmation modals for deletion with cascade warnings
 * @requires Navigation to tag editing and management
 *
 * @module routes/tags/$tagId
 *
 * @author Kyle Dunn
 */

import { Button, Center, Group, Loader, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet, useLocation, useNavigate, useNavigation, useSearchParams } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import InfoView from "~/components/base/InfoView";
import { useDesktopOnly, useFetcherWithErrorHandler } from "~/lib/hooks";
import { prisma } from "~/lib/prisma.server";
import { deleteTag, getTagById, updateTag } from "~/lib/tags.server";

/**
 * Meta function for dynamic document head configuration
 * Sets page title based on tag name or fallback for missing tags
 *
 * @param data - Loader data containing tag information
 * @returns Array of meta tags with dynamic title
 */
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: (data.tag ? `${data.tag.name} Tag` : "No Tag Found") + " | SJK Sign-Out",
    },
  ];
};

/**
 * Server-side loader function for tag data and statistics
 * Fetches tag details and related category information
 *
 * @param params - Route parameters containing tagId
 * @returns JSON response with tag data and category statistics
 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.tagId, "Expected params.tagId");

  // Fetch tag details
  const result = await getTagById(params.tagId);

  // Fetch category statistics for context
  const categoryCount =
    result.tag &&
    (await prisma.tag.groupBy({
      by: ["category"],
      orderBy: {
        category: "asc",
      },
      where: {
        category: result.tag?.category,
      },
      _count: {
        category: true,
      },
    }));

  const itemCount =
    result.tag &&
    (await prisma.item.count({
      where: {
        tags: {
          some: {
            id: result.tag.id,
          },
        },
      },
    }));

  const personCount =
    result.tag &&
    (await prisma.person.count({
      where: {
        tags: {
          some: {
            id: result.tag.id,
          },
        },
      },
    }));

  const loanCount =
    result.tag &&
    (await prisma.loan.count({
      where: {
        person: {
          tags: {
            some: {
              id: result.tag.id,
            },
          },
        },
      },
    }));

  return typedjson({
    tag: result.tag,
    error: result.error,
    categoryCount:
      categoryCount?.map((c) => ({
        category: c.category,
        count: c._count?.category,
      })) ?? undefined,
    itemCount: itemCount,
    personCount: personCount,
    loanCount: loanCount,
  });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.tagId, "Expected params.tagId");

  switch (request.method) {
    case "PATCH":
      return updateTag(params.tagId, await request.json());
    case "DELETE":
      return deleteTag(params.tagId);
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
};

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();
  const navigation = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const desktopOnly = useDesktopOnly();

  const editing = location.pathname.endsWith("edit");

  const loading =
    navigation.state === "loading" && location.pathname !== navigation.location.pathname;

  const content = loading ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : data.error ? (
    <Center w="100%" h="100%">
      <Text c="error">{data.error}</Text>
    </Center>
  ) : (
    <Outlet />
  );

  const deleteFetcher = useFetcherWithErrorHandler<typeof action>(
    (data) => {
      if (data.tag) {
        notifications.show({
          message: (
            <>
              Deleted tag: <b>{data.tag.name}</b>.
            </>
          ),
        });

        navigate("/tags");
      }
    },
    (error) => {
      notifications.show({
        message: error,
        color: "red",
      });
    }
  );

  function handleDelete() {
    // TODO - implement prompt to move all items to another tag
    modals.openConfirmModal({
      title: "Confirm Deletion",
      centered: true,
      children: (
        <Text>
          This action is irreversible, are you sure you want to delete the tag named{" "}
          <b>{data.tag?.name}</b>?
        </Text>
      ),
      labels: {
        confirm: "Yes",
        cancel: "No",
      },
      confirmProps: {
        color: "red",
      },
      onConfirm: () => {
        modals.openConfirmModal({
          title: "Confirm Deletion",
          centered: true,
          children: (
            <Text>
              This will remove this tag from all loans, items and people. Are you sure you want to
              continue?
            </Text>
          ),
          labels: {
            confirm: "Yes",
            cancel: "No",
          },
          confirmProps: {
            color: "red",
          },
          onConfirm: () => {
            modals.closeAll();
            deleteFetcher.submit(null, {
              method: "DELETE",
              encType: "application/json",
            });
          },
          onCancel: () => {
            modals.closeAll();
          },
        });
      },
      onCancel: () => {
        modals.closeAll();
      },
    });
  }

  const bottomSection = (
    <Group mt="auto" grow>
      <Button
        disabled={loading || data.tag === undefined}
        onClick={() =>
          editing
            ? navigate(-1)
            : navigate(`edit?${searchParams.toString()}`, {
                relative: "path",
              })
        }
        variant={editing ? "outline" : undefined}
      >
        {editing ? "Cancel" : "Edit"}
      </Button>
      {!editing && (
        <Button
          disabled={loading || data.tag === undefined}
          onClick={() => handleDelete()}
          color="red"
        >
          Delete
        </Button>
      )}
    </Group>
  );

  const title =
    (editing ? "Editing " : "") + (data.tag ? `#${data.tag.id} - ${data.tag.name}` : "Unknown");

  return desktopOnly === undefined ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : desktopOnly ? (
    <InfoView
      title={title}
      titleProps={editing ? { fs: "italic" } : undefined}
      headerProps={{ mb: "sm" }}
      bottomSection={bottomSection}
    >
      <ScrollArea w="100%" h="calc(100% - 50px)" type="auto" scrollbars="y">
        {content}
      </ScrollArea>
    </InfoView>
  ) : (
    <Stack h="100%">
      <Title order={2} fs={editing ? "italic" : undefined}>
        {title}
      </Title>
      {content}
      {bottomSection}
    </Stack>
  );
}
