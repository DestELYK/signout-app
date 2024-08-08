import { Box, Card, Center, Flex, Loader, ScrollArea } from "@mantine/core";
import { Tag } from "@prisma/client";
import { Outlet, useLocation, useNavigate, useNavigation } from "@remix-run/react";
import { IconEdit } from "@tabler/icons-react";
import TabbedContentView from "./components/TabbedContentView";
import TagGroup from "./components/tags/TagGroup";
import TitlePage from "./components/TitlePage";
import { useDesktopOnly } from "./lib/hooks";

export interface DetailsPageProps {
    data: {
        [value: string]: {
            label: string;
            icon: React.ReactNode;
            disabled?: boolean;
        };
    };
    topSection?: React.ReactNode;
    tags: Tag[];
    title?: string;
    desktopComponent?: React.ReactNode;
}

export default function DetailsPage({
    data,
    tags,
    title = "Unknown",
    topSection,
    desktopComponent,
}: DetailsPageProps) {
    const navigate = useNavigate();
    const navigation = useNavigation();
    const location = useLocation();

    const desktopOnly = useDesktopOnly();

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

    const pageComponent = (
        <TabbedContentView
            h="100%"
            tabs={keys.map((key) => ({
                value: key,
                label: data[key].label,
                disabled: data[key].disabled,
            }))}
            current={value}
            onChange={onChange}
        >
            <ScrollArea w="100%" h="100%" type="auto" scrollbars="y">
                <Outlet />
            </ScrollArea>
        </TabbedContentView>
    );

    return desktopOnly === undefined ? (
        <Center w="100%" h="100%">
            <Loader />
        </Center>
    ) : (
        <TitlePage
            title={title}
            buttonText="Edit"
            buttonIcon={<IconEdit />}
            topSection={topSection}
            bottomSection={<TagGroup tags={tags} groupProps={{ justify: "start" }} />}
        >
            {desktopOnly ? (
                <Flex
                    w="100%"
                    h="100%"
                    direction="row"
                    align="stretch"
                    wrap="nowrap"
                    gap="sm"
                    style={{ overflowY: "hidden" }}
                >
                    <Box w={{ lg: "calc(100% - 600px)", md: "calc(100% - 400px)" }} h="100%">
                        {desktopComponent}
                    </Box>
                    <Card w={{ lg: 600, md: 400 }} h="100%" p={0} withBorder>
                        {pageComponent}
                    </Card>
                </Flex>
            ) : (
                pageComponent
            )}
        </TitlePage>
    );
}
