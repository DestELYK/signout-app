import {
  ActionIcon,
  Button,
  Card,
  Center,
  Divider,
  Flex,
  Group,
  Highlight,
  Loader,
  Modal,
  NavLink,
  Paper,
  Tabs,
  Text,
  Title,
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
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
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

  const params = useParams();

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

      <Flex
        w="100%"
        h="calc(100dvh - 60px)"
        direction="column"
        wrap="nowrap"
        p="md"
      >
        <Group
          pos="relative"
          top={0}
          align="center"
          justify="space-between"
          pb="md"
        >
          <Title order={1}>Tags</Title>
          <Button
            onClick={() => open(true)}
            rightSection={<IconPlus />}
            visibleFrom="sm"
          >
            Create New Tag
          </Button>
          <ActionIcon size="lg" onClick={() => open(true)} hiddenFrom="sm">
            <IconPlus />
          </ActionIcon>
        </Group>
        <Divider w="100%" />
        {data.error ? (
          <Center w="100%" h="100%">
            <Text c="error">{data.error}</Text>
          </Center>
        ) : data.tags === undefined ? (
          <Center w="100%" h="100%">
            <Loader />
          </Center>
        ) : data.tags.length === 0 ? (
          <Center w="100%" h="100%">
            <Text>No tags found</Text>
          </Center>
        ) : desktopOnly ? (
          <Flex
            w="100%"
            h="calc(100% - 80px)"
            direction="row"
            wrap="nowrap"
            mt="md"
            gap="md"
            style={{ overflowY: "hidden" }}
          >
            <Card w="50%" h="100%" withBorder p="sm">
              <Card.Section mb="sm">
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
              </Card.Section>
              <ListView
                h="calc(100% - 60px)"
                initialItemsPerPage={30}
                data={data.tags}
                showPagination={false}
                withQRCode={false}
                searchPlaceholder="Search for tags..."
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
                      <Highlight highlight={query ?? ""}>{tag.name}</Highlight>
                    }
                  />
                )}
              </ListView>
            </Card>
            <Card w="50%" h="100%" withBorder p="sm">
              <Outlet />
            </Card>
          </Flex>
        ) : (
          <Outlet />
        )}
      </Flex>
    </>
  );
}
