import { Card, Center, Flex, Highlight, Loader, Stack, Text, UnstyledButton } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { IconChevronRight } from "@tabler/icons-react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ListView from "~/components/base/ListView";
import { useDesktopOnly } from "~/lib/hooks";
import { loader as locationsLoader } from "./locations";

export default function Page() {
    const data = useTypedRouteLoaderData<typeof locationsLoader>("routes/locations");
    const navigate = useNavigate();

    const desktopOnly = useDesktopOnly();

    return desktopOnly ? (
        <Card w="100%" h="100%" withBorder>
            <Center w="100%" h="100%">
                <Text c="dimmed">No location selected</Text>
            </Center>
        </Card>
    ) : desktopOnly === undefined || data === undefined ? (
        <Stack w="100%" h="100%" justify="center" align="center">
            <Loader />
            <Text className="loading-text">Loading</Text>
        </Stack>
    ) : (
        <Stack w="100%" p="md">
            <ListView
                w="100%"
                h="calc(100% - 40px)"
                initialItemsPerPage={30}
                data={data.data}
                showPagination={false}
                withQRCode={false}
                searchPlaceholder="Search for locations..."
                emptyText="No location found"
            >
                {(location, query) => (
                    <UnstyledButton
                        className="list-item"
                        w="100%"
                        h="100%"
                        onClick={() => navigate(`/locations/${location.id}`)}
                        p="xs"
                    >
                        <Flex direction="row" align="center" justify="space-between">
                            <Highlight highlight={query ? query.split(" ") : ""}>
                                {location.name}
                            </Highlight>
                            <IconChevronRight />
                        </Flex>
                    </UnstyledButton>
                )}
            </ListView>
        </Stack>
    );
}
