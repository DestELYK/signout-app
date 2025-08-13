import {
    Box,
    Button,
    Card,
    Center,
    Flex,
    Highlight,
    Loader,
    Modal,
    NavLink,
    Paper,
    Stack,
    Text,
} from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { NavLink as NavLinkRemix, Outlet, useNavigate, useSearchParams } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import TabbedContentView from "~/components/TabbedContentView";
import TitlePage from "~/components/TitlePage";
import ListView from "~/components/base/ListView";
import TagForm from "~/components/forms/TagForm";
import { handleError } from "~/lib/db.server";
import { useCreateModal, useDesktopOnly } from "~/lib/hooks";
import { prisma } from "~/lib/prisma.server";
import { TagFormSchema, TagQuerySchema } from "~/lib/schemas";
import { getTags } from "~/lib/tags.server";
import { parseNumber } from "~/utils/utils";

export const meta: MetaFunction = () => {
    return [{ title: "Tags | SJK Sign-Out" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const searchParams = new URL(request.url).searchParams;

    const limit = parseNumber(searchParams.get("limit"), 30);

    try {
        const tags = await getTags(
            TagQuerySchema.parse(searchParams.entries()),
            limit,
            parseNumber(searchParams.get("page"), 0)
        );

        const categories = await prisma.tag.groupBy({
            by: ["category"],
            orderBy: {
                category: "asc",
            },
            _count: {
                category: true,
            },
        });

        return typedjson({
            ...tags,
            categories: categories,
        });
    } catch (e) {
        return typedjson({
            error: handleError(e, "getting tags"),
            tags: undefined,
            categories: undefined,
            totalCount: undefined,
        });
    }
};

export async function action({ request }: ActionFunctionArgs) {
    try {
        switch (request.method) {
            case "POST":
                const newTag = TagFormSchema.parse(await request.json());

                const result = await prisma.tag.create({
                    data: {
                        ...newTag,
                    },
                });

                return typedjson({ tag: result });
            default:
                throw new Response(null, {
                    status: 405,
                });
        }
    } catch (e) {
        const error = handleError(e, "no tag was created");

        if (error) {
            return typedjson({ error: error, tag: undefined });
        } else {
            throw new Response(String(e), {
                status: 500,
            });
        }
    }
}

export default function Page() {
    const data = useTypedLoaderData<typeof loader>();
    const desktopOnly = useDesktopOnly();
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();

    const [opened, { open, close }] = useCreateModal();

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

    const rightSection = (
        <Button onClick={() => open()} color="blue">
            Create Tag
        </Button>
    );

    return (
        <>
            <Modal opened={opened} onClose={close} centered={true} title={"Create New Tag"}>
                <TagForm
                    initialValues={{
                        name: "",
                        color: "#000000",
                        category: "",
                        priority: 0,
                        hidden: false,
                    }}
                    type="create"
                    onResult={(data) => {
                        close();

                        navigate(`/tags/${data.data?.id}`);
                    }}
                    validateInputOnBlur={false}
                />
            </Modal>

            <Stack h="calc(100dvh - 60px)" gap={0}>
                <TitlePage title="Tags" rightSection={rightSection} />
                {data.error ? (
                    <Center w="100%" h="100%">
                        <Text c="error">{data.error}</Text>
                    </Center>
                ) : data.tags === undefined ? (
                    <Center w="100%" h="100%">
                        <Loader />
                    </Center>
                ) : desktopOnly ? (
                    <Flex w="100%" h="100%" direction="row" wrap="nowrap" gap="md" p="md">
                        <Card w="50%" h="100%" withBorder>
                            <TabbedContentView
                                h="100%"
                                tabs={[
                                    {
                                        value: "all",
                                        label: (
                                            <>
                                                All{" "}
                                                <Text span h="100%" c="dimmed" size="xs">
                                                    ({data.totalCount})
                                                </Text>
                                            </>
                                        ),
                                    },
                                    ...data.categories.map((c) => ({
                                        value: c.category,
                                        label: (
                                            <>
                                                {c.category}{" "}
                                                <Text span h="100%" c="dimmed" size="xs">
                                                    ({c._count.category})
                                                </Text>
                                            </>
                                        ),
                                    })),
                                ]}
                                current={searchParams.get("category") ?? "all"}
                                onChange={(value) => onChange(value ?? "all")}
                            />
                            <ListView
                                initialItemsPerPage={30}
                                data={data.tags}
                                showPagination={false}
                                withQRCode={false}
                                searchPlaceholder="Search for tags..."
                                emptyText="No tags found"
                                w="100%"
                                h="100%"
                                withinParent
                            >
                                {(tag, query) => (
                                    <NavLink
                                        key={tag.id}
                                        to={`/tags/${tag.id}?${searchParams.toString()}`}
                                        component={NavLinkRemix}
                                        leftSection={
                                            <Paper
                                                withBorder
                                                radius={24}
                                                w={24}
                                                h={24}
                                                style={{ backgroundColor: tag.color }}
                                            />
                                        }
                                        label={
                                            <Highlight highlight={query ?? ""}>
                                                {tag.name}
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
