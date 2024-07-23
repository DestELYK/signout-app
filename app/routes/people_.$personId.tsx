import { Center, Stack, Text } from "@mantine/core";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  IconClipboard,
  IconInfoCircle,
  IconTimeline,
} from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import DetailsPage from "~/DetailsPage";
import { handleError } from "~/lib/db.server";
import { prisma } from "~/lib/prisma.server";
import { personWithTags } from "~/utils/types.server";
import { formatFullName, isNumeric } from "~/utils/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${formatFullName(data.person)} | SJK Sign-Out` }];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.personId, "Expected params.personId");

  if (!isNumeric(params.personId)) {
    throw new Response(null, { status: 404 });
  }

  try {
    const person = await prisma.person.findFirstOrThrow({
      where: { id: Number(params.personId) },
      include: personWithTags.include,
    });

    // Gather list of loaned items
    const loanedItems = await prisma.loanedItem.findMany({
      where: {
        loan: {
          personId: Number(params.personId),
        },
      },
      orderBy: [{ dateLoaned: "desc" }, { dateReturned: "desc" }],
      include: {
        loan: {
          include: {
            tags: true,
            person: {
              include: {
                tags: true,
              },
            },
          },
        },
        item: {
          include: {
            tags: true,
          },
        },
        returnedBy: true,
      },
    });

    const outstandingItems = loanedItems.filter(
      (li) => !li.dateReturned
    ).length;

    const lostItems = loanedItems.filter((li) =>
      li.item.tags.some((t) => t.name === "Lost")
    ).length;

    const lastLoan = loanedItems[0];

    // Calculate average loan time
    let averageReturnTime = 0;
    loanedItems.forEach((li) => {
      if (li.dateReturned) {
        averageReturnTime +=
          li.dateReturned.getTime() - li.dateLoaned.getTime();
      }
    });

    if (loanedItems.length > 0) {
      averageReturnTime /= loanedItems.length;
    }
    return typedjson({
      person: person,
      outstandingItems: outstandingItems,
      lostItems: lostItems,
      totalItems: loanedItems.length,
      averageReturnTime: averageReturnTime,
      lastLoan: lastLoan,
      error: undefined,
    });
  } catch (e) {
    const error = handleError(e, "no item was returned");

    if (error) {
      return typedjson({
        error: error,
        person: undefined,
        outstanding: undefined,
        lostItems: undefined,
        totalItems: undefined,
        averageReturnTime: undefined,
        lastLoan: undefined,
      });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
};

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();

  const personView = data.error ? (
    <Center w="100%" h="100%">
      <Text c="error">{data.error}</Text>
    </Center>
  ) : data.person === undefined ? (
    <Center w="100%" h="100%">
      <Text>No person found</Text>
    </Center>
  ) : (
    <Stack w="100%"></Stack>
  );

  return data.error != undefined ? (
    <Center h="100%">
      <Text c="error">{data.error}</Text>
    </Center>
  ) : (
    <DetailsPage
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
      tags={data.person.tags}
      desktopComponent={personView}
      title={formatFullName(data.person)}
    />
  );
}
