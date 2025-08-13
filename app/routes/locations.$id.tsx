import { Button, Center, Group, Loader, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { LoaderFunctionArgs } from "@remix-run/node";

import { ActionFunctionArgs } from "@remix-run/node";
import { Outlet, useLocation, useNavigate, useNavigation, useSearchParams } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import InfoView from "~/components/base/InfoView";
import { useDesktopOnly, useFetcherWithErrorHandler } from "~/lib/hooks";
import { deleteItemLocation, getItemLocationById, updateItemLocation } from "~/lib/items.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    return typedjson(await getItemLocationById(params.id ?? ""));
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
    switch (request.method) {
        case "PATCH":
            return typedjson(await updateItemLocation(params.id ?? "", await request.json()));
        case "DELETE":
            return typedjson(await deleteItemLocation(params.id ?? ""));
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
            if (data.data) {
                notifications.show({
                    message: (
                        <>
                            Deleted location: <b>{data.data.name}</b>.
                        </>
                    ),
                });

                navigate("/locations");
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
        modals.openConfirmModal({
            title: "Confirm Deletion",
            centered: true,
            children: (
                <Text>
                    This action is irreversible, are you sure you want to delete the location named{" "}
                    <b>{data.data?.name}</b>?
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
                            This will remove this location from all items. Are you sure you want to
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
                disabled={loading || data.data === undefined}
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
                    disabled={loading || data.data === undefined}
                    onClick={() => handleDelete()}
                    color="red"
                >
                    Delete
                </Button>
            )}
        </Group>
    );

    const title =
        (editing ? "Editing " : "") +
        (data.data ? `#${data.data.id} - ${data.data.name}` : "Unknown");

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
