import { Center, Text } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  IconClipboard,
  IconInfoCircle,
  IconTimeline
} from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import ItemDetailsPage from "~/ItemDetailsPage";
import { handleError } from "~/lib/db.server";
import { prisma } from "~/lib/prisma.server";
import { itemWithTags } from "~/utils/types.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.itemId, "Expected params.itemId");

  try {
    return typedjson({
      item: await prisma.item.findFirstOrThrow({
        where: { id: parseInt(params.itemId) },
        include: itemWithTags.include,
      }),
      error: undefined,
    });
  } catch (e) {
    const error = handleError(e, "no item was returned");

    if (error) {
      return typedjson({ error: error, item: undefined });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
};

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();

  return (
      data.error != undefined ? (
        <Center h="100%">
          <Text c="error">{data.error}</Text>
        </Center>
      ) : (
        data.item !== undefined && (
          <ItemDetailsPage
            title={data.item.name}
            data={{
              overview: {
                icon: <IconInfoCircle size={24} />,
                label: "Overview",
              },
              loans: {
                icon: <IconClipboard size={24} />,
                label: "Loans",
              },
              timeline: {
                icon: <IconTimeline size={24} />,
                label: "Timeline",
              },
            }}
          />
        )
      )
  );
}
