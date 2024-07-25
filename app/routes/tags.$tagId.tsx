import {
  Button,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Tag } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { useEffect } from "react";
import { redirect, typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import InfoView from "~/components/base/InfoView";
import { handleError } from "~/lib/db.server";
import { useDesktopOnly, useFetcherWithErrorHandler } from "~/lib/hooks";
import { isNumeric } from "~/utils/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title:
        (data.tag ? `${data.tag.name} Tag` : "No Tag Found") +
        " | SJK Sign-Out",
    },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.tagId, "Expected params.tagId");

  const tagId = params.tagId;

  try {
    if (!isNumeric(tagId)) return redirect("/tags");

    const tag = await prisma.tag.findUniqueOrThrow({
      where: {
        id: Number(tagId),
      },
      include: {
        _count: {
          select: {
            items: true,
            loans: true,
            people: true,
          },
        },
      },
    });

    const categoryCount = await prisma.tag.groupBy({
      by: ["category"],
      orderBy: {
        category: "asc",
      },
      where: {
        category: tag.category,
      },
      _count: {
        category: true,
      },
    });

    return typedjson({
      tag: tag,
      categoryCount:
        categoryCount.length > 0 ? categoryCount[0]._count.category : 0,
      error: undefined,
    });
  } catch (e) {
    const error = handleError(e, "no tag was returned");

    if (error) {
      return typedjson({
        error: error,
        tag: undefined,
        categoryCount: undefined,
      });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  return typedjson({
    tag: undefined,
    error: "Not implemented",
  });
};

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();
  const navigation = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const desktopOnly = useDesktopOnly();

  const params = useParams();

  const form = useForm<Omit<Tag, "id">>({});

  useEffect(() => {
    if (data.tag) {
      form.setValues({
        ...data.tag,
      });
    }
  }, [data.tag]);

  const editing = location.pathname.endsWith("edit");

  const loading =
    navigation.state === "loading" &&
    location.pathname !== navigation.location.pathname;

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

  const submitTag = useFetcherWithErrorHandler<typeof action>(
    (data) => {
      if (data.tag) {
        notifications.show({
          message: <>Deleted tag: {/* <b>{data.tag.name}</b>. */}</>,
        });
      }
    },
    (error) => {
      form.setErrors({
        name: error,
        color: error,
      });
    }
  );

  function handleDelete() {
    // TODO - implement prompt to move all items to another tag
    // TODO - implement redirect to tags page
    modals.openConfirmModal({
      title: "Confirm Deletion",
      centered: true,
      children: (
        <Text>
          This action is irreversible, are you sure you want to delete the tag
          named <b>{form.values.name}</b>?
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
          children: <Text>Confirm if you want to delete the tag</Text>,
          labels: {
            confirm: "Yes",
            cancel: "No",
          },
          confirmProps: {
            color: "red",
          },
          onConfirm: () => {
            modals.closeAll();
            submitTag.submit(form.values, {
              method: "DELETE",
              navigate: false,
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
        disabled={loading}
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
        <Button disabled={loading} onClick={() => handleDelete()} color="red">
          Delete
        </Button>
      )}
    </Group>
  );

  const title =
    (editing ? "Editing " : "") +
    (data.tag ? `#${data.tag.id} - ${data.tag.name}` : "Unknown");

  return desktopOnly === undefined ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : desktopOnly ? (
    <InfoView
      title={title}
      titleProps={editing ? { fs: "italic" } : undefined}
      headerProps={{ withBorder: true, mb: "sm" }}
      bottomSection={bottomSection}
    >
      {content}
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
