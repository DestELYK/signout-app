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
import PersonRoleForm from "~/components/forms/PersonRoleForm";
import { useDesktopOnly } from "~/lib/hooks";
import { loader as rolesLoader } from "./people.roles";

export default function Page() {
    const data = useTypedRouteLoaderData<typeof rolesLoader>("routes/people.roles");
    const navigate = useNavigate();

    const desktopOnly = useDesktopOnly();

    const rightSection = (
        <ActionIcon size="input-sm" onClick={() => open()} color="blue">
            <IconPlus />
        </ActionIcon>
    );
    const [opened, { open, close }] = useDisclosure();

    return (
        <>
            <Modal opened={opened} onClose={close} centered={true} title={"Create New Person Role"}>
                <PersonRoleForm
                    initialValues={{
                        name: "",
                        color: "#000000",
                    }}
                    type="create"
                    onResult={(data) => {
                        close();

                        navigate(`/people/roles/${data.data?.id}`);
                    }}
                    validateInputOnBlur={false}
                />
            </Modal>
            {desktopOnly ? (
                <Card w="100%" h="100%" withBorder>
                    <Center w="100%" h="100%">
                        <Text c="dimmed">No person role selected</Text>
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
                        error={data.error}
                        rightSearchSection={rightSection}
                        searchPlaceholder="Search for person roles..."
                        emptyText="No person role found"
                    >
                        {(personRole, query) => (
                            <UnstyledButton
                                className="list-item"
                                w="100%"
                                h="100%"
                                onClick={() => navigate(`/people/roles/${personRole.id}`)}
                                p="xs"
                            >
                                <Flex direction="row" align="center" justify="space-between">
                                    <Highlight highlight={query ? query.split(" ") : ""}>
                                        {personRole.name}
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
