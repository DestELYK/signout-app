import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

import {
    ActionIcon,
    Box,
    Card,
    Flex,
    Highlight,
    Modal,
    NavLink,
    Paper,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ActionFunctionArgs } from "@remix-run/node";
import { NavLink as NavLinkRemix, Outlet, useNavigate, useSearchParams } from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import ListView from "~/components/base/ListView";
import PersonRoleForm from "~/components/forms/PersonRoleForm";
import { handleError } from "~/lib/db.server";
import { useDesktopOnly } from "~/lib/hooks";
import { createPersonRole, getPersonRoles } from "~/lib/people.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const search = new URL(request.url).searchParams;

    return typedjson(
        await getPersonRoles({
            query: search.get("query") ?? search.get("q") ?? undefined,
        })
    );
};

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        switch (request.method) {
            case "POST":
                return typedjson(await createPersonRole(await request.json()));
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
    const peopleRolesData = useTypedLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();
    const [opened, { open, close }] = useDisclosure();

    const rightSection = (
        <Tooltip label="Create New Person Role">
            <ActionIcon size="input-sm" onClick={() => open()} color="blue">
                <IconPlus />
            </ActionIcon>
        </Tooltip>
    );

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
                            rightSearchSection={rightSection}
                            initialItemsPerPage={30}
                            data={peopleRolesData.data}
                            showPagination={false}
                            withQRCode={false}
                            searchPlaceholder="Search for roles..."
                            emptyText="No roles found"
                            error={peopleRolesData.error}
                            w="100%"
                            h="100%"
                            withinParent
                        >
                            {(role, query) => (
                                <NavLink
                                    key={role.id}
                                    to={`/people/roles/${role.id}?${searchParams.toString()}`}
                                    component={NavLinkRemix}
                                    leftSection={
                                        <Paper
                                            withBorder
                                            radius={24}
                                            w={24}
                                            h={24}
                                            style={{ backgroundColor: role.color }}
                                        />
                                    }
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
        </>
    );
}
