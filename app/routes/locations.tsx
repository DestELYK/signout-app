import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { Box, Button, Card, Flex, Highlight, Modal, NavLink, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ActionFunctionArgs } from "@remix-run/node";
import { NavLink as NavLinkRemix, Outlet, useNavigate, useSearchParams } from "@remix-run/react";
import ListView from "~/components/base/ListView";
import LocationForm from "~/components/forms/LocationForm";
import TitlePage from "~/components/TitlePage";
import { handleError } from "~/lib/db.server";
import { useDesktopOnly } from "~/lib/hooks";
import { createItemLocation, getItemLocations } from "~/lib/items.server";
import { LocationSchema } from "~/lib/schemas";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const search = new URL(request.url).searchParams;

    return typedjson(
        await getItemLocations({
            query: search.get("query") ?? search.get("q") ?? undefined,
        })
    );
};

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        switch (request.method) {
            case "POST":
                const itemLocation = LocationSchema.parse(await request.json());
                return typedjson(await createItemLocation(itemLocation));
            default:
                throw new Response("Method Not Allowed", { status: 405 });
        }
    } catch (error) {
        return typedjson({ error: handleError(error) });
    }
};

export default function Page() {
    const navigate = useNavigate();
    const desktopOnly = useDesktopOnly();
    const locationsLoaderData = useTypedLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();
    const [opened, { open, close }] = useDisclosure();

    const rightSection = (
        <Button onClick={() => open()} color="blue">
            Create Location
        </Button>
    );

    return (
        <>
            <Modal opened={opened} onClose={close} centered={true} title={"Create New Location"}>
                <LocationForm
                    initialValues={{
                        name: "",
                    }}
                    type="create"
                    onResult={(data) => {
                        close();

                        navigate(`/locations/${data.data?.id}`);
                    }}
                    validateInputOnBlur={false}
                />
            </Modal>
            <Stack h="calc(100dvh - 60px)" gap={0}>
                <TitlePage title="Locations" rightSection={rightSection} />

                {desktopOnly ? (
                    <Flex
                        w="100%"
                        h="100%"
                        direction="row"
                        wrap="nowrap"
                        gap="md"
                        p="md"
                        style={{ overflowY: "hidden" }}
                    >
                        <Card w="50%" h="100%" withBorder>
                            <ListView
                                initialItemsPerPage={30}
                                data={locationsLoaderData.data}
                                showPagination={false}
                                withQRCode={false}
                                searchPlaceholder="Search for locations..."
                                emptyText="No locations found"
                                error={locationsLoaderData.error}
                                w="100%"
                                h="100%"
                                withinParent
                            >
                                {(role, query) => (
                                    <NavLink
                                        key={role.id}
                                        to={`/locations/${role.id}?${searchParams.toString()}`}
                                        component={NavLinkRemix}
                                        label={
                                            <Highlight highlight={query?.split(" ") ?? ""}>
                                                {role.name}
                                            </Highlight>
                                        }
                                    />
                                )}
                            </ListView>
                        </Card>
                        <Box w="50%" h="100%">
                            <Outlet />
                        </Box>
                    </Flex>
                ) : (
                    <Outlet />
                )}
            </Stack>
        </>
    );
}
