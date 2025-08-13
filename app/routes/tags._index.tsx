import {
    Box,
    Card,
    Center,
    Flex,
    Highlight,
    Loader,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { IconChevronRight } from "@tabler/icons-react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ListView from "~/components/base/ListView";
import { useDesktopOnly } from "~/lib/hooks";
import { loader as tagsLoader } from "./tags";

export default function Page() {
    const data = useTypedRouteLoaderData<typeof tagsLoader>("routes/tags");
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();

    const desktopOnly = useDesktopOnly();

    const onChange = (value: string) => {
        setSearchParams(
            (prev) => {
                if (value === "all") {
                    prev.delete("category");
                } else {
                    prev.set("category", value);
                }

                return prev;
            },
            { replace: true }
        );
    };

    return desktopOnly ? (
        <Card w="100%" h="100%" withBorder>
            <Center w="100%" h="100%">
                <Text c="dimmed">No tag selected</Text>
            </Center>
        </Card>
    ) : desktopOnly === undefined || data === undefined ? (
        <Stack w="100%" h="100%" justify="center" align="center">
            <Loader />
            <Text className="loading-text">Loading</Text>
        </Stack>
    ) : (
        <Stack w="100%" p="md">
            <Box w="100%" h={40}>
                <ScrollArea w="100%" type="always" scrollbars="x" offsetScrollbars="x">
                    <SegmentedControl
                        w="100%"
                        mih={40}
                        fullWidth
                        data={[
                            {
                                value: "all",
                                label: "All",
                            },
                            ...(data.categories
                                ? data.categories.map((category) => {
                                      return {
                                          value: category.category,
                                          label: category.category,
                                      };
                                  })
                                : []),
                        ]}
                        value={searchParams.get("category") ?? "all"}
                        onChange={(value) => onChange(value ?? "all")}
                    />
                </ScrollArea>
            </Box>
            <ListView
                w="100%"
                initialItemsPerPage={30}
                data={data.tags}
                showPagination={false}
                withQRCode={false}
                searchPlaceholder="Search for tags..."
                emptyText="No tags found"
            >
                {(tag, query) => (
                    <UnstyledButton
                        className="list-item"
                        w="100%"
                        h="100%"
                        onClick={() => navigate(`/tags/${tag.id}`)}
                        p="xs"
                    >
                        <Flex direction="row" align="center" justify="space-between">
                            <Highlight highlight={query ? query.split(" ") : ""}>
                                {tag.name}
                            </Highlight>
                            <IconChevronRight />
                        </Flex>
                    </UnstyledButton>
                )}
            </ListView>
        </Stack>
    );
}
