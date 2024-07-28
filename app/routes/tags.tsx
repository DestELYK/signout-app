import {
  Box,
  Card,
  Center,
  Flex,
  Group,
  Highlight,
  Loader,
  Modal,
  NavLink,
  Paper,
  Text,
} from "@mantine/core";
import { Tag } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  NavLink as NavLinkRemix,
  Outlet,
  useSearchParams,
} from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import TabbedContentView from "~/components/TabbedContentView";
import TitlePage from "~/components/TitlePage";
import ListView from "~/components/base/ListView";
import CreateTagForm from "~/components/tags/CreateTagForm";
import { handleError } from "~/lib/db.server";
import { useCreateModal, useDesktopOnly } from "~/lib/hooks";
import { prisma } from "~/lib/prisma.server";

export const meta: MetaFunction = () => {
  return [{ title: "Tags | SJK Sign-Out" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const category = url.searchParams.get("category");
  const query = url.searchParams.get("q") || url.searchParams.get("query");

  try {
    const tags = await prisma.tag.findMany({
      where: {
        ...(category && { category: category }),
        ...(query && {
          name: {
            contains: query,
          },
        }),
      },
    });

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
      tags: tags,
      totalCount: await prisma.tag.count(),
      categories: categories,
      error: undefined,
    });
  } catch (e) {
    const error = handleError(e, "no tag was returned");

    if (error) {
      return typedjson({
        error: error,
        tags: undefined,
        categories: undefined,
      });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
};

export async function action({ request }: ActionFunctionArgs) {
  const formData: Tag = await request.json();

  try {
    switch (request.method) {
      case "POST":
        if (formData.name === undefined) {
          throw new Error("Name must be provided");
        }

        if (formData.color === undefined) {
          throw new Error("Color must be provided");
        }

        if (formData.category === undefined) {
          throw new Error("Category must be provided");
        }

        if (formData.priority === undefined) {
          formData.priority = 0;
        }

        if (formData.hidden === undefined) {
          formData.hidden = false;
        }

        // TODO - blacklist categories that can't be hidden

        return typedjson({
          tag: await prisma.tag.create({
            data: {
              name: formData.name,
              color: formData.color,
              priority: formData.priority,
              category: formData.category,
              hidden: formData.hidden,
            },
          }),
          error: undefined,
        });
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

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        centered={true}
        title={"Create New Tag"}
      >
        <CreateTagForm
          onSubmitted={(data) => {
            close();
          }}
        />
      </Modal>

      <TitlePage
        title="Tags"
        buttonText="Create New Tag"
        onButtonClick={() => open(true)}
      >
        {data.error ? (
          <Center w="100%" h="100%">
            <Text c="error">{data.error}</Text>
          </Center>
        ) : data.tags === undefined ? (
          <Center w="100%" h="100%">
            <Loader />
          </Center>
        ) : desktopOnly ? (
          <Flex
            w="100%"
            h="100%"
            direction="row"
            wrap="nowrap"
            gap="md"
            style={{ overflowY: "hidden" }}
          >
            <Card w="50%" h="100%" withBorder>
              <TabbedContentView
                h="100%"
                tabs={[
                  {
                    value: "all",
                    label: (
                      <Group gap="xs">
                        All
                        <Text c="dimmed" size="xs">
                          ({data.totalCount})
                        </Text>
                      </Group>
                    ),
                  },
                  ...data.categories.map((c) => ({
                    value: c.category,
                    label: (
                      <Group gap="xs">
                        {c.category}
                        <Text c="dimmed" size="xs">
                          ({c._count.category})
                        </Text>
                      </Group>
                    ),
                  })),
                ]}
                onChange={(value) => onChange(value ?? "all")}
              >
                <ListView
                  h="100%"
                  initialItemsPerPage={30}
                  data={data.tags}
                  showPagination={false}
                  withQRCode={false}
                  searchPlaceholder="Search for tags..."
                  emptyText="No tags found"
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
              </TabbedContentView>
              {/* <Card.Section mb="sm">
                <Tabs
                  w="100%"
                  value={searchParams.get("category") ?? "all"}
                  onChange={(value) => onChange(value ?? "all")}
                >
                  <Tabs.List>
                    <Tabs.Tab value="all">
                      <Group gap="xs">
                        All
                        <Text c="dimmed" size="xs">
                          ({data.totalCount})
                        </Text>
                      </Group>
                    </Tabs.Tab>
                    {data.categories.map((category) => (
                      <Tabs.Tab
                        key={category.category}
                        value={category.category}
                      >
                        <Group gap="xs">
                          {category.category}
                          <Text c="dimmed" size="xs">
                            ({category._count.category})
                          </Text>
                        </Group>
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>
                </Tabs>
              </Card.Section> */}
            </Card>
            <Box w="50%" h="100%">
              <Outlet />
            </Box>
          </Flex>
        ) : (
          <Outlet />
        )}
      </TitlePage>
    </>
  );
}
