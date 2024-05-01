import { Center, Text } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  IconClipboard,
  IconInfoCircle,
  IconTimeline
} from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import DetailsPage from "~/DetailsPage";
import { handleError } from "~/lib/db.server";
import { prisma } from "~/lib/prisma.server";
import { itemWithTags } from "~/utils/types.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.itemId, "Expected params.itemId");

  try {
    const itemId = Number(params.itemId);

    // Get item details
    const item = await prisma.item.findFirstOrThrow({
      where: { id: itemId },
      include: { ...itemWithTags.include, _count: { select: { loans: true } } },
    });

    // Gather list of loaned items
    const loanedItems = await prisma.loanedItem.findMany({
      where: { itemId: itemId },
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
        returnedBy: true,
      },
    });

    const outstanding =
      loanedItems.filter((li) => !li.dateReturned) !== undefined;

    const lastLoan = loanedItems[0];

    // Calculate average loan time
    let averageLoanTime = 0;
    loanedItems.forEach((li) => {
      if (li.dateReturned) {
        averageLoanTime += li.dateReturned.getTime() - li.dateLoaned.getTime();
      }
    });

    if (loanedItems.length > 0) {
      averageLoanTime /= loanedItems.length;
    }

    return typedjson({
      item: item,
      outstanding: outstanding,
      lastLoan: lastLoan,
      averageLoanTime: averageLoanTime,
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

  return data.error != undefined ? (
    <Center h="100%">
      <Text c="error">{data.error}</Text>
    </Center>
  ) : (
    data.item !== undefined && (
      <DetailsPage
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
  );
}
