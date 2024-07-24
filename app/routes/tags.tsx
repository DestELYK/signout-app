import {
  Center,
  Divider,
  Flex,
  Highlight,
  Loader,
  NavLink,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { Tag } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  NavLink as NavLinkRemix,
  Outlet,
  useLocation,
  useSearchParams,
} from "@remix-run/react";
import { IconCircleFilled } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import ListView from "~/components/base/ListView";
import { handleError } from "~/lib/db.server";
import { prisma } from "~/lib/prisma.server";

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

    return typedjson({ tags: tags, error: undefined });
  } catch (e) {
    const error = handleError(e, "no tag was returned");

    if (error) {
      return typedjson({ error: error, tags: undefined });
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

  const [searchParams] = useSearchParams();

  const location = useLocation();

  const nested = !location.pathname.endsWith("/tags");

  return data.error ? (
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
  ) : (
    <Flex
      w="100%"
      h="calc(100dvh - 60px)"
      direction="column"
      wrap="nowrap"
      style={{ overflowY: "hidden" }}
      p="md"
    >
      <Title mih={60} order={1}>
        Tags
      </Title>
      <Divider w="100%" />
      <Flex
        w="100%"
        h="calc(100% - 80px)"
        direction="row"
        wrap="nowrap"
        mt="md"
        gap="md"
      >
        <Paper w="50%" h="100%" withBorder p="sm">
          <ListView
            h="100%"
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
                leftSection={<IconCircleFilled size={24} color={tag.color} />}
                label={
                  <Highlight highlight={query ?? ""}>{tag.name}</Highlight>
                }
              />
            )}
          </ListView>
        </Paper>
        <Paper w="50%" h="100%" withBorder p="sm">
          {nested ? (
            <Outlet />
          ) : (
            <Center w="100%" h="100%">
              <Text c="dimmed">No tag selected</Text>
            </Center>
          )}
        </Paper>
      </Flex>
    </Flex>
  );
}
