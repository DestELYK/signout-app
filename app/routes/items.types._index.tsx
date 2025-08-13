import {
    ActionIcon,
    Card,
    Center,
    Flex,
    Highlight,
    Loader,
    Modal,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "@remix-run/react";
import { IconChevronRight, IconPlus } from "@tabler/icons-react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ListView from "~/components/base/ListView";
import ItemTypeForm from "~/components/forms/ItemTypeForm";
import { useDesktopOnly } from "~/lib/hooks";
import { loader as itemTypesLoader } from "./items.types";

export default function Page() {
    const data = useTypedRouteLoaderData<typeof itemTypesLoader>("routes/items.types");
    const navigate = useNavigate();

    const desktopOnly = useDesktopOnly();
    const [opened, { open, close }] = useDisclosure();

    const rightSection = (
        <ActionIcon size="input-sm" onClick={() => open()} color="blue">
            <IconPlus />
        </ActionIcon>
    );

    return (
        <>
            <Modal opened={opened} onClose={close} centered={true} title={"Create New Person Role"}>
                <ItemTypeForm
                    initialValues={{
                        name: "",
                        description: "",
                    }}
                    type="create"
                    onResult={(data) => {
                        close();

                        navigate(`/items/types/${data.data?.id}`);
                    }}
                    validateInputOnBlur={false}
                />
            </Modal>

            {desktopOnly ? (
                <Card w="100%" h="100%" withBorder>
                    <Center w="100%" h="100%">
                        <Text c="dimmed">No item type selected</Text>
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
                        searchPlaceholder="Search for item types..."
                        emptyText="No item type found"
                        error={data.error}
                        rightSearchSection={rightSection}
                    >
                        {(itemType, query) => (
                            <UnstyledButton
                                className="list-item"
                                w="100%"
                                h="100%"
                                onClick={() => navigate(`/items/types/${itemType.id}`)}
                                p="xs"
                            >
                                <Flex direction="row" align="center" justify="space-between">
                                    <Highlight highlight={query ? query.split(" ") : ""}>
                                        {itemType.name}
                                    </Highlight>
                                    <IconChevronRight />
                                </Flex>
                            </UnstyledButton>
                        )}
                    </ListView>
                </Stack>
            )}
        </>
    );
}
