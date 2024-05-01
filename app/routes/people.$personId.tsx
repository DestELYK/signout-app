import { Center, Text } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { IconClipboard, IconInfoCircle, IconTimeline } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import DetailsPage from "~/DetailsPage";
import { handleError } from "~/lib/db.server";
import { prisma } from "~/lib/prisma.server";
import { personWithTags } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.personId, "Expected params.personId");

  try {
    return typedjson({
      person: await prisma.person.findFirstOrThrow({
        where: { id: parseInt(params.personId) },
        include: personWithTags.include,
      }),
      error: undefined,
    });
  } catch (e) {
    const error = handleError(e, "no item was returned");

    if (error) {
      return typedjson({ error: error, person: undefined });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
};

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();

  return data.error != undefined ? (
    <Center h="100%">
      <Text c="error">{data.error}</Text>
    </Center>
  ) : (
    data.person !== undefined && (
      <DetailsPage
        title={formatFullName(data.person)}
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
  );
}
