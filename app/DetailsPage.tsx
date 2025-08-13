import {
    ActionIcon,
    Box,
    Button,
    Card,
    Divider,
    Flex,
    Group,
    ScrollArea,
    Text,
} from "@mantine/core";
import { Outlet, useLocation, useNavigate, useNavigation } from "@remix-run/react";
import { IconEdit, IconInfoCircle, IconTrash } from "@tabler/icons-react";
import TabbedContentView from "./components/TabbedContentView";
import TagGroup, { TagGroupProps } from "./components/tags/TagGroup";
import TitlePage from "./components/TitlePage";

export interface DetailsPageProps {
    data: {
        [value: string]: {
            label: string;
            icon: React.ReactNode;
            disabled?: boolean;
            count?: number;
        };
    };
    topSection?: React.ReactNode;
    tags?: TagGroupProps["tags"];
    title?: string;
    bannerText?: string;
    desktopComponent?: React.ReactNode;
    disabled?: boolean;
    handleDelete: () => void;
}

export default function DetailsPage({
    data,
    tags,
    title = "Unknown",
    bannerText,
    topSection,
    desktopComponent,
    disabled,
    handleDelete,
}: DetailsPageProps) {
    const navigate = useNavigate();
    const navigation = useNavigation();
    const location = useLocation();

    const editing = location.pathname.endsWith("/edit");

    const keys = Object.keys(data);

    let value = keys[0];

    keys.forEach((key) => {
        if (location.pathname.includes(`/${key}`)) {
            value = key;
        }
    });

    function onChange(value?: string | null) {
        switch (value) {
            case "overview":
                navigate(`.`, {
                    replace: true,
                    relative: "route",
                });
                break;
            default:
                navigate(`./${value}`, {
                    replace: true,
                    relative: "route",
                });
                break;
        }
    }

    const rightSection = (
        <Group justify="end" gap="xs">
            {editing ? (
                <Button
                    h={40}
                    disabled={disabled}
                    variant="outline"
                    onClick={() => {
                        navigate(`.`, { replace: true, relative: "route" });
                    }}
                >
                    Cancel
                </Button>
            ) : (
                <>
                    <Button
                        h={40}
                        disabled={disabled}
                        visibleFrom="md"
                        variant="outline"
                        onClick={() => {
                            navigate(`edit`, { relative: "route" });
                        }}
                    >
                        Edit
                    </Button>
                    <ActionIcon
                        size={40}
                        disabled={disabled}
                        hiddenFrom="md"
                        onClick={() => {
                            navigate(`edit`, { relative: "route" });
                        }}
                    >
                        <IconEdit />
                    </ActionIcon>
                    <Button
                        h={40}
                        disabled={disabled}
                        visibleFrom="md"
                        variant="outline"
                        color="red"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                    <ActionIcon
                        size={40}
                        disabled={disabled}
                        color="red"
                        hiddenFrom="md"
                        onClick={handleDelete}
                    >
                        <IconTrash />
                    </ActionIcon>
                </>
            )}
        </Group>
    );

    return (
        <>
            <Flex pos="relative" w="100%" h="100%" direction="column" visibleFrom="md">
                <div
                    style={{
                        position: "sticky",
                        top: 60,
                        zIndex: 10,
                        backgroundColor: "var(--mantine-color-body)",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <TitlePage
                        title={title}
                        rightSection={rightSection}
                        topSection={topSection}
                        withDivider={bannerText === undefined}
                        bottomSection={
                            tags && <TagGroup tags={tags} groupProps={{ justify: "start" }} />
                        }
                    />
                    {bannerText && (
                        <>
                            <Divider color="red" />
                            <Group p={2}>
                                <IconInfoCircle size={12} color="red" />
                                <Text fw="bold" size="sm" c="red" ta="center">
                                    {bannerText}
                                </Text>
                            </Group>
                            <Divider color="red" />
                        </>
                    )}
                </div>
                <Flex
                    pos="relative"
                    w="100%"
                    h="100%"
                    justify="stretch"
                    direction="row"
                    p="sm"
                    gap="sm"
                >
                    <Box pos="relative" w="100%">
                        {desktopComponent}
                    </Box>
                    <Card
                        pos="relative"
                        miw={{ base: 500, lg: 600, xl: 700 }}
                        h="100%"
                        withBorder
                        padding={0}
                    >
                        <TabbedContentView
                            h="100%"
                            tabs={keys.map((key) => ({
                                value: key,
                                label:
                                    data[key].label +
                                    (data[key].count ? ` (${data[key].count})` : ""),
                                disabled: data[key].disabled,
                            }))}
                            hideTabs={editing}
                            current={value}
                            onChange={onChange}
                            disabled={disabled}
                        />
                        <Box w="100%" h="100%" pos="relative">
                            <ScrollArea w="100%" h="100%" type="auto" scrollbars="y" pos="absolute">
                                <Outlet />
                            </ScrollArea>
                        </Box>
                    </Card>
                </Flex>
            </Flex>
            <Flex direction="column" hiddenFrom="md">
                <div
                    style={{
                        position: "sticky",
                        top: 60,
                        zIndex: 10,
                        backgroundColor: "var(--mantine-color-body)",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <TitlePage
                        title={title}
                        rightSection={rightSection}
                        topSection={topSection}
                        bottomSection={
                            tags && <TagGroup tags={tags} groupProps={{ justify: "start" }} />
                        }
                        withDivider={false}
                    />
                    <TabbedContentView
                        h="100%"
                        tabs={keys.map((key) => ({
                            value: key,
                            label:
                                data[key].label + (data[key].count ? ` (${data[key].count})` : ""),
                            disabled: data[key].disabled,
                        }))}
                        hideTabs={editing}
                        current={value}
                        onChange={onChange}
                        disabled={disabled}
                    />
                    <Divider />
                </div>
                <Outlet />
            </Flex>
        </>
    );
}
